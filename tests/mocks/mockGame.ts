import { createMockChannel, createMockUser } from './';
import Setup from '@mafia/structures/Setup';
import Game from '@mafia/structures/Game';
import Player from '@mafia/structures/Player';
import { DEFAULT_GAME_SETTINGS } from '@root/lib/constants';
import { Constructor } from '@sapphire/utilities';
import Role from '@mafia/structures/Role';

import Vanilla_Mafia from '@mafia/roles/mafia/Vanilla_Mafia';
import Vanilla from '@mafia/roles/town/Vanilla';
import Goon from '@root/lib/mafia/roles/mafia/Goon';
import Cop from '@root/lib/mafia/roles/town/Cop';
import Doctor from '@root/lib/mafia/roles/town/Doctor';
import Escort from '@root/lib/mafia/roles/town/Escort';
import Godfather from '@root/lib/mafia/roles/mafia/Godfather';
import CultLeader from '@root/lib/mafia/roles/cult/Cult_Leader';
import Consigliere from '@root/lib/mafia/roles/mafia/Consigliere';


const allRoles = new Map<string, Constructor<Role>>([
	['Vanilla', Vanilla],
	['Vanilla Mafia', Vanilla_Mafia],
	['Doctor', Doctor],
	['Cop', Cop],
	['Goon', Goon],
	['Escort', Escort],
	['Godfather', Godfather],
	['Consigliere', Consigliere],
	['Cult Leader', CultLeader]
]);

interface MockGameParams {
	numPlayers: number;
	setup: Setup;
}

export const createMockGame = (params: MockGameParams) => {
	// @ts-ignore type instantiation bs
	const game = new Game(createMockUser({ username: 'Player1', discriminator: '0001' }), createMockChannel({ name: 'godfather-test' }), DEFAULT_GAME_SETTINGS);
	for (let i = 2; i <= params.numPlayers; i++) {
		// @ts-ignore type instantiation bs
		const player = new Player(createMockUser({ username: `Player${i}`, discriminator: `000${i}` }), game);
		game.players.push(player);
	}

	game.setup = params.setup;
	const { roles } = game.setup!;

	for (const player of game.players) {
		player.role = new (allRoles.get(roles.shift()!)!)(player);
	}

	return game;
};
