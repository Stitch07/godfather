import type Role from '@mafia/structures/Role';
import { AliasPiece } from '@sapphire/framework';

export default abstract class Modifier extends AliasPiece {
	/**
	 * Applies the selected modifier to a role
	 * @param role The role to modify
	 */
	public abstract patch(role: Role, extras?: any): void;

	/**
	 * Checks whether a modifier can patch a role
	 * @param role The role to check
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public canPatch(role: Role): boolean {
		return true;
	}
}
