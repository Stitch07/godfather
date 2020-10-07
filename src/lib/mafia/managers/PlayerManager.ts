import Game, { Phase } from '@mafia/Game';
import Player from '@mafia/Player';
import { User } from 'discord.js';

export interface PlayerManagerShowOptions {
	codeblock?: boolean;
	showReplacements?: boolean;
}

export default class PlayerManager extends Array<Player> {

	public replacements: User[] = [];
	public constructor(public game: Game) {
		super();
	}

	public get(user: User): Player | undefined {
		return this.find(player => player.user === user);
	}

	public async remove(player: Player): Promise<boolean> {
		if (player === this.game.host) throw 'The host cannot leave the game.';
		if (!this.game.hasStarted) {
			this.splice(this.indexOf(player), 1);
			return true;
		}
		const promptMessage = this.replacements.length > 0
			? 'You will be replaced out.'
			: 'You will be modkilled.';
		const leavePrompt = await this.game.channel.prompt(`Are you sure you want to leave? ${promptMessage}`, player.user);
		if (!leavePrompt) return false;

		if (this.replacements.length > 0) {
			const replacement = this.replacements.shift();
			await this.game.channel.send(`${replacement!.tag} has replaced ${player.user.tag}.`);
			player.user = replacement!;
			await player.sendPM();
			return true;
		}

		// modkill if nobody is replacing
		const phaseStr = this.game.phase === Phase.DAY ? 'd' : 'n';
		await this.game.channel.send(`${player.user.tag} was modkilled. They were a *${player.role!.display}*.`);
		player.kill(`modkilled ${phaseStr}${this.game.cycle}`);
		return true;
	}

	public show(options: PlayerManagerShowOptions = { codeblock: false, showReplacements: true }): string {
		const playerList = [`**Players: ${this.length}**`];
		for (const [n, player] of this.entries()) {
			let playerName = '';
			if (options.codeblock) {
				if (player.isAlive) {
					playerName = `+ ${n + 1}. ${player.user.tag}`;
				} else {
					playerName = `- ${n + 1}. ${player.user.tag} (${player.role!.display}; ${player.deathReason})`;
				}
			} else if (player.isAlive) {
				playerName = `${n + 1}. ${player.user.tag}`;
			} else {
				playerName = `${n + 1}. ~~${player.user.tag}~~ (${player.role!.display}; ${player.deathReason})`;
			}
			playerList.push(playerName);

		}

		if (this.replacements.length > 0 && options.showReplacements) {
			playerList.push(`\nReplacements: ${this.replacements.map(user => user.tag).join(', ')}`);
		}

		return playerList.join('\n');
	}

}
