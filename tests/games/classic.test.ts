import { Phase } from '@mafia/structures/Game';
import { NightActionPriority } from '@root/lib/mafia/managers/NightActionsManager';
import { init } from '@root/lib/mafia/roles';
import type Goon from '@root/lib/mafia/roles/mafia/Goon';
import type Cop from '@root/lib/mafia/roles/town/Cop';
import type Doctor from '@root/lib/mafia/roles/town/Doctor';
import type Escort from '@root/lib/mafia/roles/town/Escort';
import { cast } from '@root/lib/util/utils';
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

	const cop = cast<InstanceType<typeof Cop>>(game.players[0].role);
	const doc = cast<InstanceType<typeof Doctor>>(game.players[1].role);
	const escort = cast<InstanceType<typeof Escort>>(game.players[2].role);
	const goon = cast<InstanceType<typeof Goon>>(game.players[5].role);

	test('night 1', async () => {
		game.cycle = 1;
		await game.startNight();

		expect(game.phase).toBe(Phase.Night);
		expect(game.cycle).toBe(1);

		game.nightActions.push({
			action: doc.actions[0],
			actor: game.players[1],
			target: game.players[4],
			priority: NightActionPriority.Healer
		});

		game.nightActions.push({
			action: cop.actions[0],
			actor: game.players[0],
			target: game.players[5],
			priority: NightActionPriority.Investigative
		});

		game.nightActions.push({
			action: goon.actions[0],
			actor: game.players[5],
			target: game.players[4],
			priority: NightActionPriority.KILLER
		});

		game.nightActions.push({
			action: escort.actions[0],
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
		const promotedGoon = cast<InstanceType<typeof Goon>>(game.players[6].role);
		expect(game.phase).toBe(Phase.Night);
		expect(game.cycle).toBe(2);

		game.nightActions.push({
			action: doc.actions[0],
			actor: game.players[1],
			target: game.players[4],
			priority: NightActionPriority.Healer
		});

		game.nightActions.push({
			action: cop.actions[0],
			actor: game.players[0],
			target: game.players[1],
			priority: NightActionPriority.Investigative
		});

		game.nightActions.push({
			action: promotedGoon.actions[0],
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
