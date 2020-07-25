import { Piece, PieceOptions, Constructor } from '@klasa/core';
import { mergeDefault } from '@klasa/utils';
import SetupStore from './SetupStore';
import Role from './Role';

export interface SetupOptions extends PieceOptions {
	// the names of the roles/categories used
	roles?: Array<string>;
	// whether the setup should start at N0 instead of day 1
	nightStart?: boolean;
}

export const DEFAULT_SETUP_OPTIONS = {
	name: 'unnamed',
	nightStart: false,
	roles: [] as Array<string>
};

export default class Setup extends Piece {

	public roles: Array<string>;
	public nightStart: boolean;
	public constructor(store: SetupStore, directory: string, file: readonly string[], options: SetupOptions = {}) {
		super(store, directory, file, options as SetupOptions);
		options = mergeDefault(DEFAULT_SETUP_OPTIONS, options);
		this.name = options.name!;
		this.roles = options.roles!;
		this.nightStart = options.nightStart!;
	}

	// Returns an iterator of roles, this function is called when actually assigning roles.
	// Any algorithms used to randomize roles should be handled here.
	public *generate(): Iterator<Constructor<Role>> {
		// noop
	}

	// ok() is called while loading the setup, to check if the setup is functional
	// checks for exe with no townies/single jester setups are handled here
	public ok(): boolean {
		return true;
	}

}
