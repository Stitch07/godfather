import { Defence } from '@mafia/managers/NightActionsManager';
import Modifier from '@mafia/structures/Modifier';
import type Role from '@mafia/structures/Role';
import type { PieceContext } from '@sapphire/framework';

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
