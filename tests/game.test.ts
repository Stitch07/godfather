import Game from '@mafia/Game';
import { createMockUser } from './mocks/mockUser';
import { createMockChannel } from './mocks/mockChannel';
import Player from '@mafia/Player';
import Vanilla from '@mafia/roles/town/Vanilla';

describe('game testing', () => {
	const mockChannel = createMockChannel({ name: 'godfather-test' });
	const mockUser = createMockUser({ username: 'Host' });

	const game = new Game(mockUser, mockChannel);

	for (let i = 0; i < 5; i++) {
		const player = createMockUser({ username: `Player${i + 1}`, discriminator: `000${i + 1}` });
		game.players.push(new Player(player, game));
	}

	test('basic variables', () => {
		expect(game.host.username).toBe('Host');
		expect(game.channel.name).toBe('godfather-test');
		expect(game.majorityVotes).toBe(4);
		expect(game.players.length).toBe(6);
	});

	test('player manager', () => {
		const host = game.players[0];
		host.role = new Vanilla(host);
		host.isAlive = false;
		host.deathReason = 'killed d1';

		const EXPECTED_PLAYERLIST = [
			'**Players: 6**',
			'1. ~~Host~~ (Vanilla; killed d1)',
			'2. Player1',
			'3. Player2',
			'4. Player3',
			'5. Player4',
			'6. Player5'
		].join('\n');

		expect(game.players.show()).toBe(EXPECTED_PLAYERLIST);
	});

	test('voting manager', () => {
		// this call to reset() is required to populate the voting cache
		game.votes.reset();
		const hammered = game.votes.vote(game.players[0], game.players[1]);
		expect(hammered).toBe(false);

		const EXPECTED_VOTE_COUNT = [
			'**Vote Count**',
			'Player1 (1): Host',
			'Not Voting (5): Player1, Player2, Player3, Player4, Player5'
		].join('\n');

		expect(game.votes.show()).toBe(EXPECTED_VOTE_COUNT);
	});
});
