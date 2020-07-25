import '@lib/extenders';

import { KlasaClient } from 'klasa';
import Game from '@mafia/Game';
import SetupStore from '@mafia/SetupStore';

export default class Godfather extends KlasaClient {

	public games: Map<string, Game> = new Map();
	public setups: SetupStore;
	public constructor() {
		super({
			commands: {
				logging: true,
				prefix: 'g!'
			}
		});

		this.setups = new SetupStore(this);
		this.registerStore(this.setups);
	}

}
