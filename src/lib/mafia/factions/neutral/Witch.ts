import Faction from '@mafia/structures/Faction';
import Player from '@mafia/structures/Player';

export default class WitchFaction extends Faction {

	public name = 'Witch';

	public independent = true;

	public winCondition = 'Survive to see the Town lose the game.';

	public hasWonIndependent(player: Player) {
		const aliveTownies = player.game.players.filter(pl => pl.role.faction.name === 'Town' && pl.isAlive).length;
		return player.isAlive && aliveTownies === 0;
	}

}
