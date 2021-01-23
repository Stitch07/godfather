import Modifier from '@mafia/structures/Modifier';
import { AliasStore } from '@sapphire/framework';

export default class ModifierStore extends AliasStore<Modifier> {
  public constructor() {
    super(Modifier as any, { name: 'modifiers' });
  }
}
