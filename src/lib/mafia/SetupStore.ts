import { BaseStore, SapphireClient } from '@sapphire/framework';
import Setup from './Setup';

export default class SetupStore extends BaseStore<Setup> {

	public constructor(client: SapphireClient) {
		// @ts-ignore setup is abstract
		super(client, Setup, { name: 'setups' });
	}

}
