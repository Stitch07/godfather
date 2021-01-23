import Modifier from '@mafia/structures/Modifier';
import type Role from '@mafia/structures/Role';
import type { PieceContext } from '@sapphire/framework';

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
