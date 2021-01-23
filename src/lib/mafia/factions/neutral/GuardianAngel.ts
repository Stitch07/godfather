import Faction from '@mafia/structures/Faction';
import Player from '@mafia/structures/Player';
import { cast } from '@root/lib/util/utils';
import Guardian_Angel from '@mafia/roles/neutral/Guardian_Angel';

export default class GuardianAngelFaction extends Faction {

	public name = 'Guardian Angel';
	public winCondition = 'Keep your target alive';
	public independent = true;

	public hasWonIndependent(player: Player) {
		const { target } = cast<Guardian_Angel>(player.role);
		return target.isAlive;
	}

}
