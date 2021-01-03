import Player from '@mafia/Player';
import Vanilla from '@mafia/roles/town/Vanilla';
import Game from '@mafia/Game';
import { createMockChannel, createMockUser } from './mocks';
import Mafia_Vanilla from '@mafia/roles/mafia/Mafia_Vanilla';
import { DEFAULT_GAME_SETTINGS } from '@lib/constants';

describe('game testing', () => {
	const mockChannel = createMockChannel({ name: 'godfather-test' });
	const mockUser = createMockUser({ username: 'Host', discriminator: '0000' });

	// @ts-ignore https://github.com/microsoft/TypeScript/issues/34933
	const game = new Game(mockUser, mockChannel, DEFAULT_GAME_SETTINGS);
	game.host.role = new Vanilla(game.host);
	game.settings.dayDuration = 5 * 60;
	game.settings.nightDuration = 2 * 60;

	for (let i = 0; i < 5; i++) {
		// @ts-ignore https://github.com/microsoft/TypeScript/issues/34933
		const player = new Player(createMockUser({ username: `Player${i + 1}`, discriminator: `000${i + 1}` }), game);
		player.role = new Vanilla(player);
		game.players.push(player);
	}

	const mafiaPlayer = new Player(createMockUser({ username: 'Vanilla Mafia', discriminator: '0000' }), game);
	mafiaPlayer.role = new Mafia_Vanilla(mafiaPlayer);
	game.players.push(mafiaPlayer);

	test('basic endgame checks', async () => {
		let winCheck = game.checkEndgame();
		expect(winCheck.ended).toBe(false);

		// kill 5 townies, making it 1v1
		for (let i = 0; i < 5; i++) {
			await game.players[i].kill('mock game');
		}

		winCheck = game.checkEndgame();
		expect(winCheck.ended).toBe(true);
		expect(winCheck.winningFaction!.name).toBe('Mafia');

		await game.players[6].kill('mock game');
		winCheck = game.checkEndgame();
		expect(winCheck.ended).toBe(true);
		expect(winCheck.winningFaction!.name).toBe('Town');
	});
});
