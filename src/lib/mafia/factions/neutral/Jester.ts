import Faction from '@mafia/Faction';
import Player from '@mafia/Player';

export default class JesterFaction extends Faction {

	public name = 'Jester';
	public winCondition = 'Get eliminated by all means necessary.';
	public independent = true;

	public hasWonIndependent(player: Player) {
		return !player.isAlive && player.deathReason.includes('eliminated');
	}

}
