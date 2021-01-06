import { createMockChannel, createMockUser } from '@mocks/index';
import Setup from '@mafia/Setup';
import Game from '@mafia/Game';
import Player from '@mafia/Player';
import Role from '@mafia/Role';
import { Constructor } from '@sapphire/utilities';

interface MockGameParams {
	numPlayers: number;
	setup: Setup;
}

export const createMockGame = (params: MockGameParams) => {
	const game = new Game(createMockUser({ username: 'Host', discriminator: '0000' }), createMockChannel({ name: 'games' }));
	// the first player is always the host, so we need to add one less player
	for (let i = 1; i <= params.numPlayers - 1; i++) {
		const player = new Player(createMockUser({ username: `Player${i}`, discriminator: `000${i}` }), game);
		game.players.push(player);
	}

	game.setup = params.setup;
	const roleGen = game.setup!.generate();

	for (const player of game.players) {
		player.role = new (roleGen.next().value as Constructor<Role>)();
	}

	return game;
};
