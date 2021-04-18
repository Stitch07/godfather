import Faction from '@mafia/structures/Faction';
import type Game from '@mafia/structures/Game';

const SUPPORTING_FACTIONS = ['Survivor', 'Coven'];

export default class CovenFaction extends Faction {
	public name = 'Coven';
	public winCondition = 'game/factions:covenWinCondition';
	public informed = true;

	public hasWon(game: Game) {
		const aliveOpposing = game.players.filter((player) => player.isAlive && !SUPPORTING_FACTIONS.includes(player.role.faction.name)).length;
		const aliveFactional = game.players.filter((player) => player.isAlive && player.role.faction.name === 'Coven').length;

		return aliveOpposing === 0 && aliveFactional > 0;
	}
}
