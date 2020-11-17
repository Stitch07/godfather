import Role from '@mafia/Role';
import TownFaction from '@mafia/factions/Town';
import Player from '@mafia/Player';

export default function DethyCop<TBaseRole extends typeof Role>(BaseRole: TBaseRole) {
	// @ts-ignore tsc bug
	class DethyCop extends BaseRole {

		public faction = new TownFaction();

		public constructor(player: Player) {
			super(player);
		}

	}

	DethyCop.categories = ['Dethy Cop'];
	return DethyCop;
}
