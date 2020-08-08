import Game from '@mafia/Game';
import { createMockUser } from './mocks/mockUser';
import { createMockChannel } from './mocks/mockChannel';
import Player from '@mafia/Player';
import Vanilla from '@mafia/roles/town/Vanilla';
import Phase from '@mafia/Phase';
import { NotVoting } from '@mafia/managers/VoteManager';

describe('game testing', () => {
	const mockChannel = createMockChannel({ name: 'godfather-test' });
	const mockUser = createMockUser({ username: 'Host', discriminator: '0000' });

	expect(mockUser.tag).toBe('Host#0000');

	const game = new Game(mockUser, mockChannel);
	game.settings.dayDuration = 5 * 60;
	game.settings.nightDuration = 2 * 60;

	for (let i = 0; i < 5; i++) {
		const player = new Player(createMockUser({ username: `Player${i + 1}`, discriminator: `000${i + 1}` }), game);
		player.role = new Vanilla(player);
		game.players.push(player);
	}

	test('basic variables', () => {
		expect(game.host.user.username).toBe('Host');
		expect(game.channel.name).toBe('godfather-test');
		expect(game.majorityVotes).toBe(4);
		expect(game.players.length).toBe(6);
	});

	test('player manager', () => {
		const host = game.players[0];
		host.role = new Vanilla(host);
		host.kill('killed d1');

		const EXPECTED_PLAYERLIST = [
			'**Players: 6**',
			'1. ~~Host#0000~~ (Vanilla; killed d1)',
			'2. Player1#0001',
			'3. Player2#0002',
			'4. Player3#0003',
			'5. Player4#0004',
			'6. Player5#0005'
		].join('\n');

		expect(game.players.show()).toBe(EXPECTED_PLAYERLIST);
	});

	test('voting manager', () => {
		// this call to reset() is required to populate the voting cache
		game.votes.reset();
		// basic vote checks
		expect(() => game.votes.vote(game.players[1], game.players[1])).toThrow('Self-voting is not allowed.');
		// actual voting
		game.votes.vote(game.players[2], game.players[1]);
		game.votes.vote(game.players[3], game.players[1]);
		game.votes.vote(game.players[4], game.players[1]);
		// the 4th vote will hammer
		const hammered = game.votes.vote(game.players[0], game.players[1]);
		expect(hammered).toBe(true);

		const EXPECTED_VOTE_COUNT = [
			'**Vote Count**',
			'Player1 (4): Player2, Player3, Player4, Host',
			'Not Voting (2): Player1, Player5'
		].join('\n');

		expect(game.votes.show()).toBe(EXPECTED_VOTE_COUNT);
	});

	test('starting days', async () => {
		await game.startDay();
		expect(game.phase).toBe(Phase.DAY);
		expect(game.cycle).toBe(1);
		expect(game.channel.sendMessage).toHaveBeenCalledWith([
			'Day **1** will last 5 minutes',
			'With 5 alive, it takes 3 to lynch.'
		].join('\n'));
		// check if the voting cache was successfully populated
		expect(game.votes.get(NotVoting)).toHaveLength(5);
	});

	test('starting nights', async () => {
		await game.startNight();
		expect(game.phase).toBe(Phase.NIGHT);
		expect(game.channel.sendMessage).toHaveBeenCalledWith('Night **1** will last 2 minutes. Send in your actions quickly!');
		expect(game.host.role!.canUseAction().check).toBe(false);
	});
});
