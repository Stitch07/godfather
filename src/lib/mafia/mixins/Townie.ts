import TownFaction from '@mafia/factions/Town';
import type Player from '@mafia/structures/Player';
import type Role from '@mafia/structures/Role';

export default function Townie<TBaseRole extends typeof Role>(BaseRole: TBaseRole) {
	// @ts-ignore tsc bug
	class Townie extends BaseRole {
		public faction = new TownFaction();

		public constructor(player: Player) {
			super(player);
		}
	}

	Townie.categories = [...Townie.categories, 'Random Town', 'Good'];
	return Townie;
}
