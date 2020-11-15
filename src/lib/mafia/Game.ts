import PlayerManager from '@mafia/managers/PlayerManager';
import Godfather from '@lib/Godfather';
import Faction from '@mafia/Faction';
import Player from '@mafia/Player';
import VoteManager from '@mafia/managers/VoteManager';
import NightActionsManager from '@mafia/managers/NightActionsManager';
import Setup from './Setup';

import { TextChannel, User } from 'discord.js';
import { codeBlock } from '@sapphire/utilities';
import GameEntity from '../orm/entities/Game';
import { getRepository } from 'typeorm';
import SingleTarget from './mixins/SingleTarget';
import { PGSQL_ENABLED } from '@root/config';
import { format } from '@util/durationFormat';
import { Time } from '@sapphire/time-utilities';
import { aliveOrRecentJester } from '../util/utils';

const MAX_DELAY = 15 * Time.Minute;

export const enum Phase {
	Pregame = 1,
	Standby,
	Day,
	Night
}

export default class Game {

	public client: Godfather;
	public phase: Phase;
	public players: PlayerManager;
	public votes: VoteManager;
	public nightActions: NightActionsManager;
	public settings: GameSettings;
	/**
	 * When the current phase ends at
	 */
	public phaseEndAt?: Date = undefined;
	public cycle = 0;
	public setup?: Setup = undefined;
	/**
	 * When this game was created at - used for timing out inactive lobbies
	 */
	public createdAt!: Date;
	/**
	 * An array of user IDs of muted players
	 */
	public permissionOverwrites: string[] = [];
	public constructor(host: User, public channel: TextChannel) {
		this.client = channel.client as Godfather;
		this.phase = Phase.Pregame;
		this.players = new PlayerManager(this);
		this.players.push(new Player(host, this));
		this.votes = new VoteManager(this);
		this.nightActions = new NightActionsManager(this);
		this.settings = {
			dayDuration: 5 * 60,
			nightDuration: 2 * 60,
			overwritePermissions: true
		};
	}

	public async startDay() {
		this.phase = Phase.Standby;
		const deadPlayers = await this.nightActions.resolve();
		if (deadPlayers.length > 0) {
			const deadText = [];
			for (const deadPlayer of deadPlayers) {
				const roleText = deadPlayer.cleaned
					? 'We could not determine their role.'
					: `They were a ${deadPlayer.role!.display}`;
				deadText.push(`${deadPlayer} died last night. ${roleText}`);
			}
			await this.channel.send(deadText.join('\n'));
		}

		const winCheck = this.checkEndgame();
		if (winCheck.ended) {
			await this.end(winCheck);
			return;
		}

		// start voting phase
		this.nightActions.reset();
		this.phase = Phase.Day;
		this.cycle++;
		const alivePlayers = this.players.filter(player => player.isAlive);
		// populate voting cache
		this.votes.reset();
		this.phaseEndAt = new Date();
		this.phaseEndAt.setSeconds(this.phaseEndAt.getSeconds() + (this.settings.dayDuration));

		// send all day action pms
		for (const player of this.players) {
			if (player.isAlive && player.role.canUseAction().check && (player.role as SingleTarget).actionPhase === Phase.Day) {
				await player.role.onDay();
			}
		}

		await this.channel.send([
			`Day **${this.cycle}** will last ${format(this.settings.dayDuration * Time.Second)}`,
			`With ${alivePlayers.length} alive, it takes ${this.majorityVotes} to lynch.`
		].join('\n'));
	}

	public async startNight() {
		const winCheck = this.checkEndgame();
		if (winCheck.ended) {
			await this.end(winCheck);
			return;
		}

		this.phase = Phase.Standby;
		this.votes.reset();
		this.phaseEndAt = new Date();
		this.phaseEndAt.setSeconds(this.phaseEndAt.getSeconds() + this.settings.nightDuration);

		await this.channel.send(`Night **${this.cycle}** will last ${format(this.settings.nightDuration * Time.Second)}. Send in your actions quickly!`);
		for (const player of this.players.filter(player => aliveOrRecentJester(player) && player.role!.canUseAction().check && (player.role! as SingleTarget).actionPhase === Phase.Night)) {
			await player.role!.onNight();
		}

		this.phase = Phase.Night;
	}

	public async hammer(player: Player) {
		// locks against multiple calls to hammer()
		this.phase = Phase.Standby;
		await this.channel.send(`${player.user.tag} was hammered. They were a **${player.role!.display}**.\n${this.votes.show({ header: 'Final Vote Count', codeblock: true })}`);
		await player.kill(`lynched d${this.cycle}`);

		await this.startNight();
	}

	public async update() {
		if (!this.hasStarted) {
			const diff = Date.now() - this.createdAt.getTime();
			if (diff > MAX_DELAY) {
				await this.channel.send('The game took too long to start!');
				return this.delete();
			}
		}

		if (this.phase === Phase.Standby) return;
		if (this.phaseEndAt && Date.now() > this.phaseEndAt.getTime()) {
			if (this.phase === Phase.Day) {
				await this.channel.send('Nobody was lynched!');
				return this.startNight();
			}

			return this.startDay();
		}
	}

	public get host() {
		return this.players[0];
	}

	public get hasStarted(): boolean {
		return this.phase !== Phase.Pregame;
	}

	public get majorityVotes(): number {
		const alivePlayers = this.players.filter(player => player.isAlive);
		return Math.floor(alivePlayers.length / 2) + 1;
	}

	public checkEndgame(): EndgameCheckData {
		let winningFaction: Faction | undefined = undefined;
		let independentWins: Faction[] = [];

		for (const player of this.players) {
			if (player.role.faction.independent && player.role.faction.hasWonIndependent(player)) {
				independentWins.push(player.role.faction);
			} else if (!player.role.faction.independent && player.role.faction.hasWon(this)) {
				winningFaction = player.role.faction;
			}
		}

		return {
			ended: winningFaction !== undefined,
			winningFaction,
			independentWins
		};
	}

	public async end(data: EndgameCheckData) {
		await this.channel.send(data.winningFaction === undefined ? 'The game is over. Nobody wins!' : `The game is over. ${data.winningFaction.name} wins! 🎉`);

		const playerMapping = (player: Player, i: number) => {
			const roleText = player.previousRoles.length === 0
				? player.role.name
				: [...player.previousRoles, player.role].map(role => role.name).join('->');
			return `${i + 1}. ${player} (${roleText})`;
		};
		await this.channel.send([
			'**Final Rolelist**:',
			codeBlock('', this.players.map(playerMapping).join('\n'))
		].join('\n'));

		if (PGSQL_ENABLED) {
			const entity = new GameEntity();
			entity.setupName = this.setup!.name;
			entity.winningFaction = data.winningFaction?.name;
			entity.independentWins = data.independentWins.map(faction => faction.name);
			entity.guildID = this.channel.guild.id;
			await getRepository(GameEntity).save(entity);
		}

		await this.delete();
	}

	public async delete() {
		// free all permission overwrites
		if (this.canOverwritePermissions) {
			for (const userID of this.permissionOverwrites) {
				const overwrite = this.channel.permissionOverwrites.find(permission => permission.type === 'member' && permission.id === userID);
				if (overwrite) await overwrite.update({ SEND_MESSAGES: true });
			}
		}
		this.client.games.delete(this.channel.id);
	}

	public get canOverwritePermissions() {
		return this.settings.overwritePermissions && this.channel.permissionsFor(this.client.user!)?.has('MANAGE_CHANNELS');
	}

	public remaining(showIn = false) {
		const remaining = this.phaseEndAt!.getTime() - Date.now();
		if (remaining <= 0) return 'any time soon...';
		return showIn ? `in ${format(remaining)}` : format(remaining);
	}

}

export interface GameSettings {
	dayDuration: number;
	nightDuration: number;
	overwritePermissions: boolean;
}

export interface EndgameCheckData {
	ended: boolean;
	winningFaction: Faction | undefined;
	independentWins: Faction[];
}
