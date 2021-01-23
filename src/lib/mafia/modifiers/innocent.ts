import Modifier from '@mafia/structures/Modifier';
import { PieceContext } from '@sapphire/framework';
import Role from '@mafia/structures/Role';

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
