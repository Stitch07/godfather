import { DEFAULT_GAME_SETTINGS } from '@lib/constants';
import { allRoles, roleCategories } from '@mafia/roles';
import Executioner from '@mafia/roles/neutral/Executioner';
import Mayor from '@mafia/roles/town/Mayor';
import type Modifier from '@mafia/structures/Modifier';
import type Role from '@mafia/structures/Role';
import Setup, { SetupOptions } from '@mafia/structures/Setup';
import DefaultMap from '@root/lib/util/DefaultMap';
import { err, ok, PieceContext } from '@sapphire/framework';
import type { Constructor } from '@sapphire/utilities';
import { randomArrayItem, shuffle } from '@util/utils';
import type { Client } from 'discord.js';
import yaml from 'js-yaml';

export default class BasicSetup extends Setup {
	public randomMafia!: Constructor<Role>[];
	public randomNK!: Constructor<Role>[];
	public randomTownies!: Constructor<Role>[];
	public randomCult!: Constructor<Role>[];

	public constructor(context: PieceContext, options: SetupOptions) {
		// @ts-ignore aa aa
		super(context, options);

		this.randomTownies = roleCategories.get('Random Town')!;
		this.randomMafia = roleCategories.get('Random Mafia')!;
		this.randomNK = roleCategories.get('Neutral Killing')!;
		this.randomCult = [allRoles.get('Cult Leader')!, allRoles.get('Cult Member')!];
	}

	public generate(client: Client) {
		const generatedRoles = [];
		const uniqueRoles: Constructor<Role>[] = [];
		// This map is only used for Masons, so I've included the entire initialization in this function.
		// You should refactor this if you need this for other roles (e.g. helper method)
		const roleGroupIndices = new DefaultMap<string, number>(() => -1);
		roleGroupIndices.set('Mason', 0);

		for (const roleEntry of this.roles) {
			// Role x2 becomes Role, Role
			if (/([a-zA-Z0-9_\- ;{}]+) ?x(\d)/.test(roleEntry)) {
				const matches = /([a-zA-Z0-9_\- ;{}]+) ?x(\d+)/.exec(roleEntry)!;
				const roleName = matches[1].trimEnd();
				for (let i = 0; i < Number(matches[2]); i++) {
					generatedRoles.push(BasicSetup.resolve(client, roleName, uniqueRoles, roleGroupIndices.get(roleName)));
				}

				if (roleGroupIndices.has(roleName)) {
					roleGroupIndices.set(roleName, roleGroupIndices.get(roleName) + 1);
				}
			} else {
				generatedRoles.push(BasicSetup.resolve(client, roleEntry, uniqueRoles, roleGroupIndices.get(roleEntry)));
				if (roleGroupIndices.has(roleEntry)) {
					roleGroupIndices.set(roleEntry, roleGroupIndices.get(roleEntry) + 1);
				}
			}
		}

		return shuffle(generatedRoles);
	}

	public ok(roles: Constructor<Role>[]) {
		// games can have between 3 and MAX_PLAYERS players
		if (roles.length < 3) return err(`Setups need at least 3 roles. (currently ${roles.length})`);
		if (roles.length > DEFAULT_GAME_SETTINGS.maxPlayers)
			return err(`Setups can have at most ${DEFAULT_GAME_SETTINGS.maxPlayers} players. (currently ${roles.length})`);
		// check if there are at least 2 "main" factions, ie factions that do not win independently
		const mafiaRoles = roles.filter((role) => this.randomMafia.includes(role));
		const townRoles = roles.filter((role) => this.randomTownies.includes(role));
		const nkRoles = roles.filter((role) => this.randomNK.includes(role));
		const cultRoles = roles.filter((role) => this.randomCult.includes(role));
		// at least 2 of these should be greater than zero
		const mainFactions = [mafiaRoles.length, nkRoles.length, townRoles.length, cultRoles].filter((count) => count !== 0);
		if (mainFactions.length === 1) return err(`There must be 2 distinct factions in the game. (Town/Mafia/Neutral Killing/Cult)`);

		// check if exe has any valid targets
		if (roles.includes(Executioner)) {
			const validExeTargets = townRoles.filter((role) => role !== Mayor);
			if (validExeTargets.length === 0) return err('There are no valid exe targets in this game.');
		}
		return ok(true);
	}

	public static resolve(client: Client, roleName: string, uniqueRoles: Constructor<Role>[], roleGroupIndex: number): RoleResolverData {
		const modifiers: ModifierData[] = [];
		if (/\+(\w+)/g.test(roleName)) {
			const mods: string[] = roleName.match(/\+(\w+)/g)!;
			for (let mod of mods) {
				mod = mod.replace('+', '');
				let context: any = {};
				let count = '';
				// special cases
				if (/\d(shot|vote)/.test(mod)) {
					[, count, mod] = /(\d)(shot|vote)/.exec(mod)!;
					context = { count: Number(count) };
				}
				if (!client.stores.get('modifiers').has(mod)) throw `Invalid modifier: ${mod}`;
				modifiers.push({ modifier: client.stores.get('modifiers').get(mod)!, context });
			}
		}

		roleName = roleName.replace(/\+\w+/g, '').trim();
		const role = BasicSetup._resolve(client, roleName, uniqueRoles);
		// @ts-ignore tsc doesn't recognize static fields
		if (role.unique) {
			uniqueRoles.push(role);
		}

		return { modifiers, role, roleGroupIndex };
	}

	/**
	 * Returns a Setup class from a user supplied string
	 * @param data The setup data the user supplies
	 */
	public static create(client: Client, data: string): BasicSetup {
		// eslint-disable-next-line @typescript-eslint/init-declarations
		let setupData: SetupData;
		const rawData = yaml.load(data)!;
		if (typeof rawData === 'string' && rawData.includes(',')) {
			setupData = { roles: rawData.split(',').map((role) => role.trim()) };
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
			BasicSetup.resolve(client, role, [], -1);
		}

		// @ts-ignore this is a hack, but is required
		const setup = new BasicSetup({ path: '', store: client.stores.get('setups'), name: setupData.name ?? 'Custom' });
		setup.roles = setupData.roles;
		setup.nightStart = setupData.nightStart ?? false;
		return setup;
	}

	private static _resolve(client: Client, roleName: string, uniqueRoles: Constructor<Role>[]): Constructor<Role> {
		if (allRoles.has(roleName)) return allRoles.get(roleName)!;
		else if (roleCategories.has(roleName)) return randomArrayItem(roleCategories.get(roleName)!.filter((role) => !uniqueRoles.includes(role)))!;

		// Role1 | Role2 (one of these 2)
		if (/(\w+) ?\| ?(\w+)/.test(roleName)) {
			const possibleRoles = /(\w+) ?\| ?(\w+)/.exec(roleName)!.slice(1, 3);
			return this.resolve(client, randomArrayItem(possibleRoles)!, uniqueRoles, -1).role;
		}

		// Category MINUS Role(s)
		if (/([a-zA-Z0-9_ ,]+) ?- ?{?([a-zA-Z0-9_ ;]+)}?/.test(roleName)) {
			let [, category, excludedRoles] = /([a-zA-Z0-9_ ,]+) ?- ?{?([a-zA-Z0-9_ ;]+)}?/.exec(roleName)!;
			category = category.trimEnd();
			if (!roleCategories.has(category)) throw 'The LHS of the MINUS operator has to be a role category.';
			const excludedRoleCtors = excludedRoles.split(';').map((roleName) => {
				roleName = roleName.trimLeft();
				if (!allRoles.has(roleName)) throw `"${roleName}" is not a valid role name.`;
				return allRoles.get(roleName)!;
			});

			const validRoles = roleCategories.get(category)!.filter((role) => !excludedRoleCtors.includes(role));
			if (validRoles.length === 0) throw 'You cannot exclude all roles from a category.';
			return randomArrayItem(validRoles)!;
		}

		throw `Invalid role provided: \`${roleName}\`.`;
	}
}

export interface SetupData {
	name?: string;
	roles: string[];
	nightStart?: boolean;
}

export interface RoleResolverData {
	role: Constructor<Role>;
	modifiers: ModifierData[];
	roleGroupIndex: number;
}

export interface ModifierData {
	modifier: Modifier;
	context: any;
}
