import PlayerManager from '@mafia/managers/PlayerManager';
import Godfather from '@lib/Godfather';
import Player from '@mafia/Player';
import VoteManager from '@mafia/managers/VoteManager';
import NightActionsManager from '@mafia/managers/NightActionsManager';
import Setup from './Setup';

import { TextChannel, User } from 'discord.js';
import { Duration } from '@klasa/duration';

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
		await player.kill(`lynched d${this.cycle}`);

		await this.channel.send(`${player.user.tag} was hammered. They were a **${player.role!.display}**.`);
		await this.startNight();
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

	public delete(): void {
		this.client.games.delete(this.channel.id);
	}

}

export interface GameSettings {
	dayDuration: number;
	nightDuration: number;
}
