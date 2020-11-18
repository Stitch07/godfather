import Setup from './Setup';
import Role from './Role';
import { shuffle, randomArray } from '@lib/util/utils';
import yaml = require('js-yaml');
import { allRoles, roleCategories } from './roles';
import { Constructor } from '@sapphire/utilities';

export default class BasicSetup extends Setup {

	public generate() {
		const generatedRoles = [];
		const shuffled = shuffle(this.roles);
		const uniqueRoles: Constructor<Role>[] = [];

		for (const roleName of shuffled) {
			// Role x2 becomes Role, Role
			if (/(\w+ ?\w+ ?) ?x(\d)/.test(roleName)) {
				const matches = /(\w+ ?\w+ ?) ?x(\d)/.exec(roleName)!;
				for (let i = 0; i < Number(matches[2]); i++) {
					generatedRoles.push(BasicSetup.resolve(matches[1].trimEnd(), uniqueRoles));
				}
				continue;
			}
			generatedRoles.push(BasicSetup.resolve(roleName, uniqueRoles));
		}

		return generatedRoles;
	}

	public static resolve(roleName: string, uniqueRoles: Constructor<Role>[]): Constructor<Role> {
		const role = BasicSetup._resolve(roleName, uniqueRoles);
		// @ts-ignore tsc doesn't recognize static fields
		if (role.unique) {
			uniqueRoles.push(role);
		}

		return role;
	}

	/**
	 * Returns a Setup class from a user supplied string
	 * @param data The setup data the user supplies
	 */
	public static create(data: string): BasicSetup {
		// eslint-disable-next-line @typescript-eslint/init-declarations
		let setupData: SetupData;
		const rawData = yaml.safeLoad(data);
		if (typeof rawData === 'string' && rawData.includes(',')) {
			setupData = { roles: rawData.split(',').map(role => role.trim()) };
		} else if (Array.isArray(rawData)) {
			setupData = { roles: rawData as string[] };
		} else if (typeof rawData === 'object' && Reflect.has(rawData, 'roles')) {
			setupData = rawData as SetupData;
		} else {
			throw 'Invalid setup format provided.'; // TODO: better error msg
		}

		for (const role of setupData.roles) {
			// this will throw if an invalid role was provided
			if (/(\w+ ?\w+ ?) ?x(\d)/.test(role)) continue;
			BasicSetup.resolve(role, []);
		}

		// @ts-ignore this is a hack, but is required
		const setup = new BasicSetup({ path: '', store: null }, { name: setupData.name ?? 'Custom' });
		setup.roles = setupData.roles;
		setup.nightStart = setupData.nightStart ?? false;
		return setup;
	}

	private static _resolve(roleName: string, uniqueRoles: Constructor<Role>[]): Constructor<Role> {
		if (allRoles.has(roleName)) return allRoles.get(roleName)!;
		else if (roleCategories.has(roleName)) return randomArray(roleCategories.get(roleName)!.filter(role => !uniqueRoles.includes(role)))!;

		// Role1 | Role2 (one of these 2)
		if (/(\w+) ?\| ?(\w+)/.test(roleName)) {
			const possibleRoles = /(\w+) ?\| ?(\w+)/.exec(roleName)!.slice(1, 3);
			return this.resolve(randomArray(possibleRoles)!, uniqueRoles);
		}

		throw `Invalid role provided: \`${roleName}\`.`;
	}

}

export interface SetupData {
	name?: string;
	roles: string[];
	nightStart?: boolean;
}
