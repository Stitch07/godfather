import Modifier from '@mafia/structures/Modifier';
import { PieceContext } from '@sapphire/framework';
import Role from '@mafia/structures/Role';

export default class SuspiciousModifier extends Modifier {

	public constructor(context: PieceContext) {
		super(context, {
			aliases: ['sus', 'susp', 'miller']
		});
	}

	public patch(role: Role) {
		role.modifiers.innocence = false;
	}

}
