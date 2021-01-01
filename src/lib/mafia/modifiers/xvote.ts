import Modifier from '#mafia/structures/Modifier';
import { PieceContext } from '@sapphire/framework';
import Role from '#mafia/structures/Role';

export default class XVoteModifier extends Modifier {

	public constructor(context: PieceContext) {
		super(context, {
			name: 'vote'
		});
	}

	public patch(role: Role, { count }: { count: number }) {
		role.modifiers.voteWeight = Math.min(count, 3);
	}

}
