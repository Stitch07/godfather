import Setup, { SetupOptions } from './Setup';
import Role from './Role';
import { shuffle, randomArray } from '@util/utils';
import yaml = require('js-yaml');
import { allRoles, roleCategories } from '../roles';
import { Constructor } from '@sapphire/utilities';
import { err, ok, PieceContext } from '@sapphire/framework';
import Executioner from '../roles/neutral/Executioner';
import Mayor from '../roles/town/Mayor';
import { DEFAULT_GAME_SETTINGS } from '../../constants';
import Modifier from './Modifier';
import { Client } from 'discord.js';

export default class BasicSetup extends Setup {

	public randomMafia!: Constructor<Role>[];
	public randomNK!: Constructor<Role>[];
	public randomTownies!: Constructor<Role>[];

	public constructor(context: PieceContext, options: SetupOptions) {
		super(context, options);

		this.randomTownies = roleCategories.get('Random Town')!;
		this.randomMafia = roleCategories.get('Random Mafia')!;
		this.randomNK = roleCategories.get('Neutral Killing')!;
	}

	public generate(client: Client) {
		const generatedRoles = [];
		const shuffled = shuffle(this.roles);
		const uniqueRoles: Constructor<Role>[] = [];

		for (const roleName of shuffled) {
			// Role x2 becomes Role, Role
			if (/(\w+ ?\w+ ?) ?x(\d)/.test(roleName)) {
				const matches = /(\w+ ?\w+ ?) ?x(\d+)/.exec(roleName)!;
				for (let i = 0; i < Number(matches[2]); i++) {
					generatedRoles.push(BasicSetup.resolve(client, matches[1].trimEnd(), uniqueRoles));
				}
				continue;
			}
			generatedRoles.push(BasicSetup.resolve(client, roleName, uniqueRoles));
		}

		return generatedRoles;
	}

	public ok(roles: Constructor<Role>[]) {
		// games can have between 3 and MAX_PLAYERS players
		if (roles.length < 3) return err(`Setups need at least 3 roles. (currently ${roles.length})`);
		if (roles.length > DEFAULT_GAME_SETTINGS.maxPlayers) return err(`Setups can have at most ${DEFAULT_GAME_SETTINGS.maxPlayers} players. (currently ${roles.length})`);
		// check if there are at least 2 "main" factions, ie factions that do not win independently
		const mafiaRoles = roles.filter(role => this.randomMafia.includes(role));
		const townRoles = roles.filter(role => this.randomTownies.includes(role));
		const nkRoles = roles.filter(role => this.randomNK.includes(role));
		// at least 2 of these should be greater than zero
		const mainFactions = [mafiaRoles.length, nkRoles.length, townRoles.length].filter(count => count !== 0);
		if (mainFactions.length === 1) return err(`There must be 2 distinct factions in the game. (Town/Mafia/Neutral Killing)`);

		// check if exe has any valid targets
		if (roles.includes(Executioner)) {
			const validExeTargets = townRoles.filter(role => role !== Mayor);
			if (validExeTargets.length === 0) return err('There are no valid exe targets in this game.');
		}
		return ok(true);
	}

	public static resolve(client: Client, roleName: string, uniqueRoles: Constructor<Role>[]): RoleResolverData {
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
				if (!client.modifiers.has(mod)) throw `Invalid modifier: ${mod}`;
				modifiers.push({ modifier: client.modifiers.get(mod)!, context });
			}

		}

		roleName = roleName.replace(/\+\w+/g, '').trim();
		const role = BasicSetup._resolve(client, roleName, uniqueRoles);
		// @ts-ignore tsc doesn't recognize static fields
		if (role.unique) {
			uniqueRoles.push(role);
		}

		return { modifiers, role };
	}

	/**
	 * Returns a Setup class from a user supplied string
	 * @param data The setup data the user supplies
	 */
	public static create(client: Client, data: string): BasicSetup {
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
			BasicSetup.resolve(client, role, []);
		}

		// @ts-ignore this is a hack, but is required
		const setup = new BasicSetup({ path: '', store: client.setups, name: setupData.name ?? 'Custom' });
		setup.roles = setupData.roles;
		setup.nightStart = setupData.nightStart ?? false;
		return setup;
	}

	private static _resolve(client: Client, roleName: string, uniqueRoles: Constructor<Role>[]): Constructor<Role> {
		if (allRoles.has(roleName)) return allRoles.get(roleName)!;
		else if (roleCategories.has(roleName)) return randomArray(roleCategories.get(roleName)!.filter(role => !uniqueRoles.includes(role)))!;

		// Role1 | Role2 (one of these 2)
		if (/(\w+) ?\| ?(\w+)/.test(roleName)) {
			const possibleRoles = /(\w+) ?\| ?(\w+)/.exec(roleName)!.slice(1, 3);
			return this.resolve(client, randomArray(possibleRoles)!, uniqueRoles).role;
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
}

export interface ModifierData {
	modifier: Modifier;
	context: any;
}
