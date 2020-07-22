import '@lib/extenders';

import { KlasaClient } from 'klasa';
import Game from '@mafia/Game';

export default class Godfather extends KlasaClient {

	public games: Map<string, Game> = new Map();
	public constructor() {
		super({
			commands: {
				logging: true,
				prefix: 'g!'
			}
		});
	}

}
