import Faction from '@mafia/structures/Faction';
import type Player from '@mafia/structures/Player';

export default class SurivorFaction extends Faction {
	public name = 'Survivor';
	public winCondition = 'Live to see the end of the game.';
	public independent = true;

	public hasWonIndependent(player: Player) {
		return player.isAlive;
	}
}
