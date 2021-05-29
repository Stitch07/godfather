import Modifier from '@mafia/structures/Modifier';
import type Role from '@mafia/structures/Role';
import type { PieceContext } from '@sapphire/framework';

const VALID_ROLES = ['Vigilante', 'Goon', 'Godfather', 'Serial Killer'];

export default class XShotModifier extends Modifier {
	public constructor(context: PieceContext) {
		super(context, {
			name: 'shot'
		});
	}

	public patch(role: Role, { count }: { count: number }) {
		// TODO: make this work on actions -- this will need to be rewritten entirely
		// cast<Killer>(role).bullets = Math.min(count, 4);
	}

	public canPatch(role: Role) {
		return VALID_ROLES.includes(role.name);
	}
}
