import Modifier from '@mafia/structures/Modifier';
import type Role from '@mafia/structures/Role';
import type { PieceContext } from '@sapphire/framework';

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
