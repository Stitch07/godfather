import Faction from '@mafia/structures/Faction';
import type Game from '@mafia/structures/Game';

const WINS_WITH = ['Town', 'Survivor'];

export default class TownFaction extends Faction {
	public name = 'Town';

	public winCondition = 'game/factions:townWinCondition';

	public hasWon(game: Game): boolean {
		const { players } = game;

		const aliveTownies = players.filter((player) => player.isAlive && player.role!.faction.name === this.name);
		const aliveOpposing = players.filter((player) => player.isAlive && !WINS_WITH.includes(player.role!.faction.name));

		return aliveTownies.length > 0 && aliveOpposing.length === 0;
	}
}
