import { createMockGame, createMockSetup } from './mocks';

describe('game testing', () => {
	const game = createMockGame({
		numPlayers: 7,
		setup: createMockSetup({
			roles: ['Vanilla', 'Vanilla', 'Vanilla', 'Vanilla', 'Vanilla', 'Vanilla', 'Goon']
		})
	});

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
