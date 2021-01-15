import { createMockChannel, createMockUser } from '@mocks/index';
import Setup from '@mafia/structures/Setup';
import Game from '@mafia/structures/Game';
import Player from '@mafia/structures/Player';
import { DEFAULT_GAME_SETTINGS } from '@root/lib/constants';
import { allRoles } from '@root/lib/mafia/roles';

interface MockGameParams {
	numPlayers: number;
	setup: Setup;
}

export const createMockGame = (params: MockGameParams) => {
	// @ts-ignore type instantiation bs
	const game = new Game(createMockUser({ username: 'Host', discriminator: '0000' }), createMockChannel({ name: 'games' }), DEFAULT_GAME_SETTINGS);
	// the first player is always the host, so we need to add one less player
	for (let i = 1; i <= params.numPlayers - 1; i++) {
		// @ts-ignore type instantiation bs
		const player = new Player(createMockUser({ username: `Player${i}`, discriminator: `000${i}` }), game);
		game.players.push(player);
	}

	game.setup = params.setup;
	const { roles } = game.setup!;

	for (const player of game.players) {
		player.role = new (allRoles.get(roles.shift()!)!)();
	}

	return game;
};
