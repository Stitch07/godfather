import Faction from '@mafia/Faction';
import Player from '@mafia/Player';

export default class SurivorFaction extends Faction {

	public name = 'Survivor';
	public winCondition = 'Live to see the end of the game.';
	public independent = true;

	public hasWonIndependent(player: Player) {
		return player.isAlive;
	}

}
