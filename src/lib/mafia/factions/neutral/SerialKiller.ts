import Faction from '@mafia/structures/Faction';
import type Game from '@mafia/structures/Game';

const WINS_WITH = ['Juggernaut', 'Survivor'];

export default class SerialKillerFaction extends Faction {
	public name = 'Serial Killer';
	public winCondition = 'game/factions:nkWinCondition';

	public hasWon(game: Game) {
		const { players } = game;

		const aliveSerialKillers = players.filter((player) => player.isAlive && player.role.faction.name === 'Serial Killer');
		const aliveOpposing = players.filter((player) => player.isAlive && !WINS_WITH.includes(player.role!.faction.name));

		return aliveSerialKillers.length > 0 && aliveOpposing.length === 0;
	}
}
