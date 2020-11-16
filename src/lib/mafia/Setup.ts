import { BasePiece } from '@sapphire/framework';
import { PieceContext, PieceOptions } from '@sapphire/pieces';
import { mergeDefault, Constructor } from '@sapphire/utilities';
import Role from './Role';

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

export default abstract class Setup extends BasePiece {

	public roles: string[];
	public nightStart: boolean;
	public description: string | null = null;
	public constructor(context: PieceContext, options: SetupOptions = {}) {
		super(context, { ...options, name: (options.name ?? context.name).toLowerCase() });
		options = mergeDefault(DEFAULT_SETUP_OPTIONS, options);
		this.roles = options.roles!;
		this.nightStart = options.nightStart!;
	}

	// Any algorithms used to randomize roles should be handled here.
	public abstract generate(): Constructor<Role>[];

	// ok() is called while loading the setup, to check if the setup is functional
	// checks for exe with no townies/single jester setups are handled here
	public ok(): boolean {
		return true;
	}

	public get totalPlayers() {
		return this.roles.length;
	}

}
