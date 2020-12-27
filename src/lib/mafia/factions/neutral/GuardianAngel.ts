import Faction from '#mafia/Faction';
import Player from '#mafia/Player';
import { cast } from '#root/lib/util/utils';
import Guardian_Angel from '#mafia/roles/neutral/Guardian_Angel';

export default class GuardianAngelFaction extends Faction {

	public name = 'Guardian Angel';
	public winCondition = 'Keep your target alive';
	public independent = true;

	public hasWonIndependent(player: Player) {
		const { target } = cast<Guardian_Angel>(player.role);
		return target.isAlive;
	}

}
