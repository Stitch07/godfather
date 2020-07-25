import { KlasaUser } from 'klasa';

import Phase from '@mafia/Phase';
import PlayerManager from '@mafia/managers/PlayerManager';
import Godfather from '@lib/Godfather';
import Player from '@mafia/Player';
import VoteManager, { notVoting } from '@mafia/managers/VoteManager';
import GodfatherChannel from '@lib/extensions/GodfatherChannel';
import NightActionsManager from '@mafia/managers/NightActionsManager';

export default class Game {

	public client: Godfather;
	public phase: Phase;
	public players: PlayerManager;
	public votes: VoteManager;
	public settings: GameSettings;
	public nightActions: NightActionsManager;
	public phaseEndAt?: Date;
	public cycle = 0;
	public constructor(public host: KlasaUser, public channel: GodfatherChannel) {
		this.client = channel.client as Godfather;
		this.phase = Phase.STANDBY;
		this.players = new PlayerManager(this);
		this.players.push(new Player(host, this));
		this.votes = new VoteManager(this);
		this.nightActions = new NightActionsManager(this);
		this.settings = {
			dayDuration: channel.guild.settings.get('defaultDayDuration') as number,
			nightDuration: channel.guild.settings.get('defaultNightDuration') as number
		};
		this.phaseEndAt = undefined;
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
			await this.channel.sendMessage(deadText.join('\n'));
		}
		// start voting phase
		this.nightActions.reset();
		this.phase = Phase.DAY;
		this.cycle++;
		const alivePlayers = this.players.filter(player => player.isAlive);
		// populate voting cache
		this.votes.reset();
		for (const alivePlayer of alivePlayers) {
			this.votes.get(notVoting)!.push({ by: alivePlayer });
		}

		await this.channel.sendMessage([
			`Day **${this.cycle}** will last ${Math.round(this.settings.dayDuration / 60)} minutes.`,
			`With ${alivePlayers.length} alive, it takes ${this.majorityVotes} to lynch.`
		].join('\n'));
	}

	public get hasStarted(): boolean {
		return this.phase === Phase.PREGAME;
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
