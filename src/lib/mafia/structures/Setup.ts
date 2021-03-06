import { ok, Piece, Result, SapphireClient } from '@sapphire/framework';
import type { PieceContext, PieceOptions } from '@sapphire/pieces';
import { Constructor, mergeDefault } from '@sapphire/utilities';
import type { RoleResolverData } from './BasicSetup';
import type Role from './Role';

export interface SetupOptions extends PieceOptions {
	// the names of the roles/categories used
	roles?: string[];
	// whether the setup should start at N0 instead of day 1
	nightStart?: boolean;
}

export const DEFAULT_SETUP_OPTIONS = {
	name: 'unnamed',
	nightStart: false,
	roles: [] as string[]
};

export interface ISetup {
	roles: string[];
	nightStart: boolean;
}

export default abstract class Setup extends Piece implements ISetup {
	public roles: string[];
	public nightStart: boolean;
	public description: string | null = null;
	public constructor(context: PieceContext, options: SetupOptions = {}) {
		// @ts-ignore aaaa
		super(context, { ...options, name: (options.name ?? context.name).toLowerCase() });
		options = mergeDefault(DEFAULT_SETUP_OPTIONS, options);
		this.roles = options.roles!;
		this.nightStart = options.nightStart!;
	}

	// Any algorithms used to randomize roles should be handled here.
	public abstract generate(client: SapphireClient): RoleResolverData[];

	// ok() is called while loading the setup, to check if the setup is functional
	// checks for exe with no townies/single jester setups are handled here
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public ok(roles: Constructor<Role>[]): Result<boolean, string> {
		return ok(true);
	}

	public get totalPlayers() {
		return this.generate(this.context.client).length;
	}
}
