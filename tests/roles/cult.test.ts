/**
 * This test tries to cover all possible cult mechanics
 * Starting off with a Consig, a Godfather, a Doctor, a Vanilla and a Cult Leader
 *
 * On N1, the CL tries to convert the Consig and fails; killing the consig
 * On N2, the CL tries to convert the Godfather and fails; sparing the GF
 * On N3, the CL tries to convert the Vanilla (healed by the Doc) and fails
 * On N4, the CL tries to convert the Vanilla and is successful
 * On N5, the CL does not have an action
 */

import { NightActionPriority } from '@mafia/managers/NightActionsManager';
import { init } from '@mafia/roles';
import { Phase } from '@mafia/structures/Game';
import { createMockGame, createMockSetup } from '../mocks/';

beforeAll(async (done) => {
  await init();
  done();
});

describe('cult mechanics', () => {
  const game = createMockGame({
    numPlayers: 5,
    setup: createMockSetup({
      roles: ['Consigliere', 'Godfather', 'Doctor', 'Vanilla', 'Cult Leader'],
      nightStart: true
    })
  });
  // easy access
  const cl = game.players[4];

  test('night 1', async () => {
    game.cycle = 1;
    await game.startNight();

    expect(game.phase).toBe(Phase.Night);
    expect(game.cycle).toBe(1);
    expect(cl.role.canUseAction().check).toBe(true);

    game.nightActions.push({
      actor: cl,
      target: game.players[0],
      action: 'convert',
      priority: NightActionPriority.CultLeader
    });
  });

  test('day 2', async () => {
    await game.startDay();

    expect(game.players[0].isAlive).toBe(false);
    expect(game.players[0].user.send).toHaveBeenNthCalledWith(2, ['You were denounced by a Cult Leader.', 'You have died!'].join('\n'));
  });

  test('night 2', async () => {
    await game.startNight();

    expect(cl.role.canUseAction().check).toBe(true);

    game.nightActions.push({
      actor: cl,
      target: game.players[1],
      action: 'convert',
      priority: NightActionPriority.CultLeader
    });
  });

  test('day 3', async () => {
    await game.startDay();

    expect(game.players[1].isAlive).toBe(true);
  });

  test('night 3', async () => {
    await game.startNight();

    expect(cl.role.canUseAction().check).toBe(true);

    game.nightActions.push({
      actor: cl,
      target: game.players[3],
      action: 'convert',
      priority: NightActionPriority.CultLeader
    });
    game.nightActions.push({
      actor: game.players[2],
      target: game.players[3],
      action: 'heal',
      priority: NightActionPriority.DOCTOR
    });
  });

  test('day 4', async () => {
    await game.startDay();

    expect(game.players[3].role.faction.name).toBe('Town');
  });

  test('night 4', async () => {
    await game.startNight();

    expect(cl.role.canUseAction().check).toBe(true);

    game.nightActions.push({
      actor: cl,
      target: game.players[3],
      action: 'convert',
      priority: NightActionPriority.CultLeader
    });
  });

  test('day 5', async () => {
    await game.startDay();

    // at last, a successful conversion
    expect(game.players[3].role.faction.name).toBe('Cult');
    expect(game.players[3].user.send).toHaveBeenNthCalledWith(2, 'You were converted by a Cult!');
    expect(cl.user.send).toHaveBeenNthCalledWith(5, 'You successfully converted Player4!');
  });

  test('night 5', async () => {
    await game.startNight();

    expect(cl.role.canUseAction().check).toBe(false);
  });
});
