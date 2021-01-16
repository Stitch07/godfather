import { NightActionPriority } from '@root/lib/mafia/managers/NightActionsManager';
import { Phase } from '@mafia/structures/Game';
import { createMockGame, createMockSetup } from '../mocks';
import { init } from '@root/lib/mafia/roles';

beforeAll(async done => {
	await init();
	done();
});

describe('classic setup', () => {
	const game = createMockGame({
		numPlayers: 7,
		setup: createMockSetup({
			roles: ['Cop', 'Doctor', 'Vanilla', 'Vanilla', 'Vanilla', 'Goon', 'Vanilla Mafia'],
			nightStart: true
		})
	});

	test('night 1', async () => {
		game.cycle = 1;
		await game.startNight();

		expect(game.phase).toBe(Phase.Night);
		expect(game.cycle).toBe(1);

		game.nightActions.push({
			action: 'heal',
			actor: game.players[1],
			target: game.players[4],
			priority: NightActionPriority.DOCTOR
		});

		game.nightActions.push({
			action: 'check',
			actor: game.players[0],
			target: game.players[5],
			priority: NightActionPriority.COP
		});

		game.nightActions.push({
			action: 'shoot',
			actor: game.players[5],
			target: game.players[4],
			priority: NightActionPriority.KILLER
		});
	});

	test('day 2', async () => {
		await game.startDay();
		// check if action results worked
		expect(game.players[0].user.send).toHaveBeenNthCalledWith(2, 'Your target is suspicious.');
		expect(game.players[4].user.send).toHaveBeenNthCalledWith(1, 'You were attacked but somebody nursed you back to health!');
		expect(game.players[5].user.send).toHaveBeenNthCalledWith(2, 'Your target was too strong to kill!');
		// day 2 voting
		game.votes.vote(game.players[0], game.players[5]);
		game.votes.vote(game.players[1], game.players[5]);
		game.votes.vote(game.players[2], game.players[5]);
		// hammer
		expect(game.votes.vote(game.players[3], game.players[5])).toBe(true);
		await game.hammer(game.players[5]);

		expect(game.channel.send).toHaveBeenNthCalledWith(3, [
			`Player6#0006 was hammered. They were a **Goon**. We could not find a will.`,
			`**Final Vote Count**`,
			'```',
			'Player6 (4): Player1, Player2, Player3, Player4 (Hammered)',
			'Not Voting (3): Player5, Player6, Player7',
			'```'
		].join('\n'));

		// Vanilla Maf is promoted to Goon
		expect(game.players[6].user.send).toHaveBeenNthCalledWith(1, 'You have been promoted to a Goon!');
		expect(game.players[6].role.name).toBe('Goon');
	});

	test('night 2', () => {
		expect(game.phase).toBe(Phase.Night);
		expect(game.cycle).toBe(2);

		game.nightActions.push({
			action: 'heal',
			actor: game.players[1],
			target: game.players[4],
			priority: NightActionPriority.DOCTOR
		});

		game.nightActions.push({
			action: 'check',
			actor: game.players[0],
			target: game.players[1],
			priority: NightActionPriority.COP
		});

		game.nightActions.push({
			action: 'shoot',
			actor: game.players[6],
			target: game.players[1],
			priority: NightActionPriority.KILLER
		});
	});

	test('day 3', async () => {
		await game.startDay();
		// Doc was attacked and successfully killed. Cop also checked them.
		expect(game.players[0].user.send).toHaveBeenNthCalledWith(4, 'Your target is innocent.');
		expect(game.players[1].user.send).toHaveBeenNthCalledWith(3, [
			'You were shot by a Goon!',
			'You have died!'
		].join('\n'));
		expect(game.channel.send).toHaveBeenNthCalledWith(6, 'Player2 died last night. They were a **Doctor**. We could not find a will.');
	});
});
