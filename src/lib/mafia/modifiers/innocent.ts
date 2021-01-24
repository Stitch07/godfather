import Modifier from '@mafia/structures/Modifier';
import type Role from '@mafia/structures/Role';
import type { PieceContext } from '@sapphire/framework';

export default class InnocentModifier extends Modifier {
	public constructor(context: PieceContext) {
		super(context, {
			aliases: ['inno']
		});
	}

	public patch(role: Role) {
		role.modifiers.innocence = true;
	}
}
