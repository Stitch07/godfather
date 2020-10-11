import PlayerManager from '@mafia/managers/PlayerManager';
import Godfather from '@lib/Godfather';
import Faction from '@mafia/Faction';
import Player from '@mafia/Player';
import VoteManager from '@mafia/managers/VoteManager';
import NightActionsManager from '@mafia/managers/NightActionsManager';
import Setup from './Setup';

import { TextChannel, User } from 'discord.js';
import { Duration } from '@klasa/duration';
import { codeBlock } from '@sapphire/utilities';

const MAX_DELAY = 5 * 60 * 1000; // 15 minutes

export const enum Phase {
	PREGAME = 1,
	STANDBY,
	DAY,
	NIGHT
}

export default class Game {

	public client: Godfather;
	public phase: Phase;
	public players: PlayerManager;
	public votes: VoteManager;
	public nightActions: NightActionsManager;
	public settings: GameSettings;
	public phaseEndAt?: Date = undefined;
	public cycle = 0;
	public setup?: Setup = undefined;
	public createdAt!: Date;
	public constructor(host: User, public channel: TextChannel) {
		this.client = channel.client as Godfather;
		this.phase = Phase.PREGAME;
		this.players = new PlayerManager(this);
		this.players.push(new Player(host, this));
		this.votes = new VoteManager(this);
		this.nightActions = new NightActionsManager(this);
		this.settings = {
			dayDuration: 5 * 60,
			nightDuration: 2 * 60
		};
	}

	public async startDay() {
		const winCheck = this.checkEndgame();
		if (winCheck.ended) {
			await this.end(winCheck);
			return;
		}

		this.phase = Phase.STANDBY;
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
		// start voting phase
		this.nightActions.reset();
		this.phase = Phase.DAY;
		this.cycle++;
		const alivePlayers = this.players.filter(player => player.isAlive);
		// populate voting cache
		this.votes.reset();
		this.phaseEndAt = new Date();
		this.phaseEndAt.setSeconds(this.phaseEndAt.getSeconds() + (this.settings.dayDuration));

		await this.channel.send([
			`Day **${this.cycle}** will last ${Duration.toNow(this.phaseEndAt)}`,
			`With ${alivePlayers.length} alive, it takes ${this.majorityVotes} to lynch.`
		].join('\n'));
	}

	public async startNight() {
		const winCheck = this.checkEndgame();
		if (winCheck.ended) {
			await this.end(winCheck);
			return;
		}

		this.phase = Phase.STANDBY;
		this.votes.reset();
		this.phaseEndAt = new Date();
		this.phaseEndAt.setSeconds(this.phaseEndAt.getSeconds() + this.settings.nightDuration);

		await this.channel.send(`Night **${this.cycle}** will last ${Duration.toNow(this.phaseEndAt)}. Send in your actions quickly!`);
		for (const player of this.players.filter(player => player.role!.canUseAction().check)) {
			await player.role!.onNight();
		}

		this.phase = Phase.NIGHT;
	}

	public async hammer(player: Player) {
		if (this.phase === Phase.STANDBY) return;
		await this.channel.send(`${player.user.tag} was hammered. They were a **${player.role!.display}**.`);
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

		if (this.phase === Phase.STANDBY) return;
		if (this.phaseEndAt && Date.now() > this.phaseEndAt.getTime()) {
			if (this.phase === Phase.DAY) {
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
		return this.phase !== Phase.PREGAME;
	}

	public get majorityVotes(): number {
		const alivePlayers = this.players.filter(player => player.isAlive);
		return Math.floor(alivePlayers.length / 2) + 1;
	}

	public checkEndgame(): EndgameCheckData {
		let winningFaction: Faction | null = null;
		let independentWins: Faction[] = [];

		for (const player of this.players) {
			if (player.role.faction.independent && player.role.faction.hasWonIndependent(player)) {
				independentWins.push(player.role.faction);
			} else if (player.role.faction.hasWon(this)) {
				winningFaction = player.role.faction;
			}
		}

		return {
			ended: winningFaction !== null,
			winningFaction,
			independentWins
		};
	}

	public async end(data: EndgameCheckData) {
		await this.channel.send(data.winningFaction === null ? 'The game is over. Nobody wins!' : `The game is over. ${data.winningFaction.name} wins! 🎉`);

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
		// TODO: win/loss logs here
		this.delete();
	}

	public delete(): void {
		this.client.games.delete(this.channel.id);
	}

}

export interface GameSettings {
	dayDuration: number;
	nightDuration: number;
}

export interface EndgameCheckData {
	ended: boolean;
	winningFaction: Faction | null;
	independentWins: Faction[];
}
