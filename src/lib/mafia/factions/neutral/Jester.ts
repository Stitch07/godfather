import Faction from '@mafia/structures/Faction';
import Player from '@mafia/structures/Player';

export default class JesterFaction extends Faction {

	public name = 'Jester';
	public winCondition = 'Get eliminated by all means necessary.';
	public independent = true;

	public hasWonIndependent(player: Player) {
		return !player.isAlive && player.deathReason.includes('eliminated');
	}

}
