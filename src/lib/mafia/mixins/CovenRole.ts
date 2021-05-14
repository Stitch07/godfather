import type Role from '@mafia/structures/Role';
import CovenFaction from '@mafia/factions/Coven';

export default function CovenRole<TBaseRole extends typeof Role>(BaseRole: TBaseRole) {
	// @ts-ignore tsc bug
	class CovenRole extends BaseRole {
		public faction = new CovenFaction();
	}

	CovenRole.categories = [...CovenRole.categories, 'Random Coven', 'Evil'];
	return CovenRole;
}
