import Setup from './Setup';
import Role from './Role';
import { shuffle, randomArray } from '@lib/util/utils';
import { allRoles, roleCategories } from './roles';
import { Constructor } from '@lib/types/definitions';

export default class BasicSetup extends Setup {

	public *generate(): Iterator<Constructor<Role>> {
		const shuffled = shuffle(this.roles);
		// TODO: category resolving goes here
		for (const roleName of shuffled) {
			if (!allRoles.has(roleName)) {
				// assume category, because ok() should have failed for an invalid category name
				// TODO: unique roles can only be used once
				yield randomArray(roleCategories.get(roleName)!);
			}
			yield allRoles.get(roleName)!;
		}
	}

}
