import { AliasStore } from '@sapphire/framework';
import Modifier from '@mafia/structures/Modifier';

export default class ModifierStore extends AliasStore<Modifier> {

	public constructor() {
		super(Modifier as any, { name: 'modifiers' });
	}

}
