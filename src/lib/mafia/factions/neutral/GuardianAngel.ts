import type Guardian_Angel from '@mafia/roles/neutral/Guardian_Angel';
import Faction from '@mafia/structures/Faction';
import type Player from '@mafia/structures/Player';
import { cast } from '@root/lib/util/utils';

export default class GuardianAngelFaction extends Faction {
	public name = 'Guardian Angel';
	public winCondition = 'game/factions:guardianAngelWinCondition';
	public independent = true;

	public hasWonIndependent(player: Player) {
		const { target } = cast<Guardian_Angel>(player.role);
		return target.isAlive;
	}
}
