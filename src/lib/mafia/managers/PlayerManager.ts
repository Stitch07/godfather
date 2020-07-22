import { KlasaUser } from 'klasa';

import Game from '@mafia/Game';
import Player from '@mafia/Player';

export interface PlayerManagerShowOptions {
	codeblock?: boolean;
	showReplacements?: boolean;
}

export default class PlayerManager extends Array<Player> {

	public replacements: Array<KlasaUser> = [];
	public constructor(public game: Game) {
		super();
	}

	public show(options: PlayerManagerShowOptions = { codeblock: false, showReplacements: true }): string {
		const playerList = [];
		for (const [n, player] of this.entries()) {
			let playerName = '';
			if (options.codeblock) {
				if (player.isAlive) {
					playerName = `+ ${n + 1}. ${player.user.tag}`;
				} else {
					playerName = `- ${n + 1}. ${player.user.tag} (${player.role!.displayRole}; ${player.deathReason})`;
				}
			} else if (player.isAlive) {
				playerName = `${n + 1}. ${player.user.tag}`;
			} else {
				playerName = `${n + 1}. ~~${player.user.tag}~~ (${player.role!.displayRole}; ${player.deathReason})`;
			}
			playerList.push(playerName);

		}

		if (this.replacements && options.showReplacements) {
			playerList.push(`\nReplacements: ${this.replacements.map(user => user.tag).join(', ')}`);
		}

		return playerList.join('\n');
	}

}
