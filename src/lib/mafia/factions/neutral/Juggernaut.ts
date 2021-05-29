import Faction from '@mafia/structures/Faction';
import type Game from '@mafia/structures/Game';

const WINS_WITH = ['Juggernaut', 'Witch', 'Survivor'];

export default class JuggernautFaction extends Faction {
	public name = 'Juggernaut';
	public winCondition = 'game/factions:nkWinCondition';

	public hasWon(game: Game) {
		const aliveOpposing = game.players.filter((player) => player.isAlive && !WINS_WITH.includes(player.role.faction.name)).length;
		const aliveFactional = game.players.filter((player) => player.isAlive && player.role.faction.name === 'Juggernaut').length;

		return aliveOpposing === 0 && aliveFactional > 0;
	}
}
