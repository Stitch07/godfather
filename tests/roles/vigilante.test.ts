import { NightActionPriority } from '@mafia/managers/NightActionsManager';
import { init } from '@mafia/roles';
import { Phase } from '@mafia/structures/Game';
import type Vigilante from '@root/lib/mafia/roles/town/Vigilante';
import { cast } from '@root/lib/util/utils';
import { createMockGame, createMockSetup } from '../mocks/';

beforeAll(async (done) => {
	await init();
	done();
});

/**
 * Vigilante shoots Vanilla Townie N1
 * Vigilante has guilt and cannot shoot N2
 * Vigilante dies at start of D3.
 */
describe('vigilante guilt, shots remaining', () => {
	const game = createMockGame({
		numPlayers: 7,
		setup: createMockSetup({
			roles: ['Vanilla', 'Vanilla', 'Vanilla', 'Vanilla', 'Vigilante', 'Vanilla Mafia', 'Vanilla Mafia'],
			nightStart: true
		})
	});
	const vig = game.players[4];

	test('night 1', async () => {
		game.cycle = 1;
		await game.startNight();

		expect(game.phase).toBe(Phase.Night);
		expect(game.cycle).toBe(1);
		expect(cast<InstanceType<typeof Vigilante>>(vig.role).canUseAction().check).toBe(true);

		game.nightActions.push({
			actor: vig,
			target: game.players[1],
			action: cast<InstanceType<typeof Vigilante>>(vig.role).actions[0],
			priority: NightActionPriority.KILLER
		});
	});

	test('day 2', async () => {
		await game.startDay();
		expect(game.players[0].isAlive).toBe(true);
		expect(game.players[1].isAlive).toBe(false);
		expect(game.players[2].isAlive).toBe(true);
		expect(game.players[3].isAlive).toBe(true);
		expect(game.players[4].isAlive).toBe(true);
		expect(game.players[5].isAlive).toBe(true);
		expect(game.players[6].isAlive).toBe(true);
		expect(cast<InstanceType<typeof Vigilante>>(vig.role).cycleGuiltObtained).toBe(1);
	});

	test('night 2', async () => {
		await game.startNight();
		expect(cast<InstanceType<typeof Vigilante>>(vig.role).canUseAction().check).toBe(false);
	});

	test('day 3', async () => {
		await game.startDay();
		expect(game.players[0].isAlive).toBe(true);
		expect(game.players[1].isAlive).toBe(false);
		expect(game.players[2].isAlive).toBe(true);
		expect(game.players[3].isAlive).toBe(true);
		expect(vig.isAlive).toBe(false);
		expect(game.players[5].isAlive).toBe(true);
		expect(game.players[6].isAlive).toBe(true);
	});
});

// Same case as above, but vigilante has no shots remaining after guilt.
describe('vigilante no guilt + vigilante guilt with no shots remaining', () => {
	const game = createMockGame({
		numPlayers: 5,
		setup: createMockSetup({
			roles: ['Vanilla', 'Vanilla', 'Vanilla', 'Vigilante', 'Vanilla Mafia'],
			nightStart: true
		})
	});
	const vig = game.players[3];

	test('night 1', async () => {
		game.cycle = 1;
		await game.startNight();

		expect(game.phase).toBe(Phase.Night);
		expect(game.cycle).toBe(1);
		expect(cast<InstanceType<typeof Vigilante>>(vig.role).canUseAction().check).toBe(true);

		game.nightActions.push({
			actor: vig,
			target: game.players[1],
			action: cast<InstanceType<typeof Vigilante>>(vig.role).actions[0],
			priority: NightActionPriority.KILLER
		});
	});

	test('day 2', async () => {
		await game.startDay();
		expect(game.players[0].isAlive).toBe(true);
		expect(game.players[1].isAlive).toBe(false);
		expect(game.players[2].isAlive).toBe(true);
		expect(game.players[3].isAlive).toBe(true);
		expect(game.players[4].isAlive).toBe(true);
		expect(cast<InstanceType<typeof Vigilante>>(vig.role).cycleGuiltObtained).toBe(1);
	});

	test('night 2', async () => {
		await game.startNight();
		expect(cast<InstanceType<typeof Vigilante>>(vig.role).canUseAction().check).toBe(false);
	});

	test('day 3', async () => {
		await game.startDay();
		expect(game.players[0].isAlive).toBe(true);
		expect(game.players[1].isAlive).toBe(false);
		expect(game.players[2].isAlive).toBe(true);
		expect(game.players[3].isAlive).toBe(false);
		expect(game.players[4].isAlive).toBe(true);
	});
});
