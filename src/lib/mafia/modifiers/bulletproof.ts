import Modifier from '@mafia/structures/Modifier';
import { PieceContext } from '@sapphire/framework';
import Role from '@mafia/structures/Role';
import { Defence } from '@mafia/managers/NightActionsManager';

export default class BulletproofModifier extends Modifier {

	public constructor(context: PieceContext) {
		super(context, {
			aliases: ['bp']
		});
	}

	public patch(role: Role) {
		role.modifiers.defence = Defence.Basic;
	}

}
