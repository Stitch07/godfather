import { BaseStore, SapphireClient } from '@sapphire/framework';
import Setup from './Setup';

export default class SetupStore extends BaseStore<Setup> {

	public constructor(client: SapphireClient) {
		// @ts-ignore we cannot pass abstract classes as ctors
		super(client, Setup, { name: 'setups' });
	}

}
