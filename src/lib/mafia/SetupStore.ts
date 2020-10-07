import { BaseStore, SapphireClient } from '@sapphire/framework';
import Setup from './Setup';

export default class SetupStore extends BaseStore<Setup> {

	public constructor(client: SapphireClient) {
		super(client, Setup, { name: 'setups' });
	}

}
