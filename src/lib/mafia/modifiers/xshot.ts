import Modifier from '@mafia/structures/Modifier';
import Role from '@mafia/structures/Role';
import { cast } from '@util/utils';
import { PieceContext } from '@sapphire/framework';
import Killer from '../mixins/Killer';

const VALID_ROLES = ['Vigilante', 'Goon', 'Godfather', 'Serial Killer'];

export default class XShotModifier extends Modifier {

	public constructor(context: PieceContext) {
		super(context, {
			name: 'shot'
		});
	}

	public patch(role: Role, { count }: { count: number }) {
		cast<Killer>(role).bullets = Math.min(count, 4);
	}

	public canPatch(role: Role) {
		return VALID_ROLES.includes(role.name);
	}

}
