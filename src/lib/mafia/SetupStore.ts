import { Store, PieceConstructor } from '@klasa/core';
import { KlasaClient } from 'klasa';
import Setup from './Setup';

export default class SetupStore extends Store<Setup> {

	public constructor(client: KlasaClient) {
		super(client, 'setups', Setup as PieceConstructor<Setup>);
	}

}
