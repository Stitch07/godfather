import Faction from '@mafia/structures/Faction';
import type Game from '../structures/Game';

const SUPPORTING_FACTIONS = ['Witch', 'Survivor', 'Cult'];

export default class CultFaction extends Faction {
	public name = 'Cult';
	public winCondition = 'game/factions:cultWinCondition';
	public informed = true;

	public hasWon(game: Game) {
		const aliveOpposing = game.players.filter((player) => player.isAlive && !SUPPORTING_FACTIONS.includes(player.role.faction.name)).length;
		const aliveFactional = game.players.filter((player) => player.isAlive && player.role.faction.name === 'Cult').length;

		return aliveOpposing === 0 && aliveFactional > 0;
	}
}
