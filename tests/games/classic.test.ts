import { Phase } from '@mafia/structures/Game';
import { NightActionPriority } from '@root/lib/mafia/managers/NightActionsManager';
import { init } from '@root/lib/mafia/roles';
import { createMockGame, createMockSetup } from '../mocks';

beforeAll(async (done) => {
	await init();
	done();
});

describe('classic setup', () => {
	const game = createMockGame({
		numPlayers: 7,
		setup: createMockSetup({
			roles: ['Cop', 'Doctor', 'Escort', 'Vanilla', 'Vanilla', 'Goon', 'Vanilla Mafia'],
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

		game.nightActions.push({
			action: 'roleblock',
			actor: game.players[2],
			target: game.players[5],
			priority: NightActionPriority.ESCORT
		});
	});

	test('day 2', async () => {
		await game.startDay();
		// day 2 voting
		game.votes.vote(game.players[0], game.players[5]);
		game.votes.vote(game.players[1], game.players[5]);
		game.votes.vote(game.players[2], game.players[5]);
		// hammer
		expect(game.votes.vote(game.players[3], game.players[5])).toBe(true);
		await game.hammer(game.players[5]);

		// Vanilla Maf is promoted to Goon
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
		expect(game.players[1].isAlive).toBe(false);
	});
});
