import PlayerManager from '@mafia/managers/PlayerManager';
import Godfather from '@lib/Godfather';
import Faction from '@mafia/Faction';
import Player from '@mafia/Player';
import VoteManager from '@mafia/managers/VoteManager';
import NightActionsManager from '@mafia/managers/NightActionsManager';
import Setup from './Setup';

import { Collection, TextChannel, User } from 'discord.js';
import { codeBlock } from '@sapphire/utilities';
// import GameEntity from '../orm/entities/Game';
// import { getRepository } from 'typeorm';
import SingleTarget from './mixins/SingleTarget';
// import { PGSQL_ENABLED } from '@root/config';
import { format } from '@util/durationFormat';
import { Time } from '@sapphire/time-utilities';
import { fauxAlive, listItems } from '../util/utils';
import { ENABLE_PRIVATE_CHANNELS, PGSQL_ENABLED, PRIVATE_CHANNEL_SERVER } from '@root/config';
import { getConnection, getRepository } from 'typeorm';
import GameEntity from '../orm/entities/Game';
import PlayerEntity from '../orm/entities/Player';
import { STALEMATE_PRIORITY_ORDER } from '../constants';

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
	/**
	 * The number of consecutive phases with zero kills
	 */
	public idlePhases = 0;
	public factionalChannels = new Collection<string, [TextChannel, string]>();
	public constructor(host: User, public channel: TextChannel, public settings: GameSettings) {
		this.client = channel.client as Godfather;
		this.phase = Phase.Pregame;
		this.players = new PlayerManager(this);
		this.players.push(new Player(host, this));
		this.votes = new VoteManager(this);
		this.nightActions = new NightActionsManager(this);
	}

	public async startDay() {
		this.phase = Phase.Standby;
		if (this.cycle !== 0) {
			const deadPlayers = await this.nightActions.resolve();
			if (deadPlayers.length > 0) {
				this.idlePhases = 0;
				const deadText = [];
				for (const deadPlayer of deadPlayers) {
					const roleText = deadPlayer.cleaned
						? 'We could not determine their role.'
						: `They were a ${deadPlayer.role!.display}`;
					deadText.push(`${deadPlayer} died last night. ${roleText}`);
				}
				await this.channel.send(deadText.join('\n'));
			}

			this.idlePhases++;
		}

		const winCheck = this.checkEndgame();
		if (winCheck.ended) {
			await this.end(winCheck);
			return;
		}

		if (this.idlePhases === 6) {
			return this.end({ ...winCheck, winningFaction: undefined });
		}

		if (this.canOverwritePermissions) {
			for (const muted of this.players.filter(player => player.isAlive)) {
				await this.channel.updateOverwrite(muted.user, {
					SEND_MESSAGES: true,
					ADD_REACTIONS: true
				}).catch(() => null);
				this.permissionOverwrites.push(muted.user.id);
			}
		}

		// start voting phase
		this.nightActions.reset();
		this.phase = Phase.Day;
		this.cycle++;
		const alivePlayers = this.players.filter(player => player.isAlive);
		// populate voting cache
		this.votes.reset();
		this.phaseEndAt = new Date(Date.now() + this.settings.dayDuration);

		// send all day action pms
		for (const player of this.players) {
			// clear visitors
			player.visitors = [];
			if (player.isAlive && player.role.canUseAction().check && (player.role as SingleTarget).actionPhase === Phase.Day) {
				await player.role.onDay();
			}
		}

		await this.channel.send([
			`Day **${this.cycle}** will last ${format(this.settings.dayDuration)}`,
			`With ${alivePlayers.length} alive, it takes ${this.majorityVotes} to lynch.`
		].join('\n'));
	}

	public async startNight() {
		const winCheck = this.checkEndgame();
		if (winCheck.ended) {
			await this.end(winCheck);
			return;
		}

		if (this.idlePhases === 6) {
			return this.end({ ...winCheck, winningFaction: undefined });
		}

		if (this.canOverwritePermissions) {
			for (const muted of this.players) {
				await this.channel.updateOverwrite(muted.user, {
					SEND_MESSAGES: false,
					ADD_REACTIONS: false
				});
				this.permissionOverwrites.push(muted.user.id);
			}
		}

		this.phase = Phase.Standby;
		this.votes.reset();
		this.phaseEndAt = new Date(Date.now() + this.settings.nightDuration);
		this.nightActions.protectedPlayers = [];

		await this.channel.send(`Night **${this.cycle}** will last ${format(this.settings.nightDuration)}. Send in your actions quickly!`);
		if (this.isFullMoon) await this.channel.send('Beware, tonight is a full moon 🌕');
		for (const player of this.players.filter(player => fauxAlive(player) && player.role!.canUseAction().check && (player.role! as SingleTarget).actionPhase === Phase.Night)) {
			await player.role!.onNight();
		}

		this.phase = Phase.Night;
	}

	public async hammer(player: Player) {
		// locks against multiple calls to hammer()
		this.phase = Phase.Standby;
		if (!player.isAlive) return;

		await this.channel.send(`${player.user.tag} was hammered. They were a **${player.role!.display}**.\n${this.votes.show({ header: 'Final Vote Count', codeblock: true })}`);
		await player.kill(`lynched D${this.cycle}`);
		this.idlePhases = 0;

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
				this.idlePhases++;
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

	public get isFullMoon(): boolean {
		return this.cycle % 2 === 0;
	}

	public get majorityVotes(): number {
		const alivePlayers = this.players.filter(player => player.isAlive);
		return Math.floor(alivePlayers.length / 2) + 1;
	}

	public checkEndgame(): EndgameCheckData {
		let winningFaction: Faction | undefined = undefined;
		let independentWins: Player[] = [];

		const alivePlayers = this.players.filter(player => player.isAlive);

		// 1v1 may need to be specially dealt with by the stalemate detector
		if (alivePlayers.length === 2 && alivePlayers.filter(player => STALEMATE_PRIORITY_ORDER.includes(player.role.name)).length === 2) {
			const [priorityOne, priorityTwo] = alivePlayers.map(player => STALEMATE_PRIORITY_ORDER.indexOf(player.role.name));
			if (priorityOne > priorityTwo) winningFaction = alivePlayers[0].role.faction;
			else if (priorityTwo > priorityOne) winningFaction = alivePlayers[1].role.faction;
		}

		for (const player of this.players) {
			if (player.role.faction.independent && player.role.faction.hasWonIndependent(player)) {
				independentWins.push(player);
			} else if (!player.role.faction.independent && player.role.faction.hasWon(this)) {
				winningFaction = player.role.faction;
			}
		}

		// if there are no major factions left end game immediately
		const majorFactions = this.players.filter(player => player.isAlive && !player.role.faction.independent);
		if (majorFactions.length === 0) {
			return {
				ended: true,
				winningFaction: undefined,
				independentWins
			};
		}

		// draw by wipeout
		if (alivePlayers.length === 0) {
			return {
				ended: true,
				winningFaction: undefined,
				independentWins
			};
		}

		return {
			ended: winningFaction !== undefined,
			winningFaction,
			independentWins
		};
	}

	public async end(data: EndgameCheckData) {
		await this.channel.send([
			data.winningFaction === undefined ? 'The game is over. Nobody wins!' : `The game is over. ${data.winningFaction.name} wins! 🎉`,
			data.independentWins.length === 0 ? null : `Independent wins: ${listItems(data.independentWins.map(player => `${player.user.username} (${player.role.faction.name})`))}`
		].filter(text => text !== null).join('\n'));

		const playerMapping = (player: Player, i: number) => {
			const roleText = player.previousRoles.length === 0
				? player.role.name
				: [...player.previousRoles, player.role].map(role => role.name).join(' -> ');
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
			entity.independentWins = data.independentWins.map(player => player.role.name);
			entity.guildID = this.channel.guild.id;
			await getRepository(GameEntity).save(entity);

			await getConnection()
				.createQueryBuilder()
				.insert()
				.into(PlayerEntity)
				.values(this.players.map(player => ({
					userID: player.user.id,
					faction: player.role.faction.name,
					roleName: player.role.name,
					result: data.winningFaction?.name === player.role.faction.name || data.independentWins.includes(player)
				})))
				.execute();
		}

		await this.delete();
	}

	public async delete() {
		// free all permission overwrites
		if (this.canOverwritePermissions && this.hasStarted) {
			for (const userID of this.permissionOverwrites) {
				const overwrite = this.channel.permissionOverwrites.find(permission => permission.type === 'member' && permission.id === userID);
				if (overwrite) await overwrite.update({ SEND_MESSAGES: true, ADD_REACTIONS: true });
			}
		}

		if (ENABLE_PRIVATE_CHANNELS && this.hasStarted) {
			for (const player of this.players) {
				if (player.role.faction.informed && this.factionalChannels.has(player.role.faction.name)) {
					const channelServer = this.client.guilds.cache.get(PRIVATE_CHANNEL_SERVER)!;
					if (channelServer.members.cache.has(player.user.id)) {
						const member = channelServer.members.cache.get(player.user.id)!;
						await member.kick().catch(() => null);
					}
				}
			}
		}

		for (const [factionalChannel] of this.factionalChannels.values()) {
			await factionalChannel.delete();
		}

		this.client.games.delete(this.channel.id);
	}

	public get canOverwritePermissions() {
		return this.settings.overwritePermissions && this.channel.permissionsFor(this.client.user!)?.has(['MANAGE_CHANNELS', 'MANAGE_ROLES']);
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
	maxPlayers: number;
	disableWhispers: boolean;
}

export interface EndgameCheckData {
	ended: boolean;
	winningFaction: Faction | undefined;
	independentWins: Player[];
}
