import { NotVoting } from '@mafia/managers/VoteManager';
import { Phase } from '@mafia/structures/Game';
import { createMockGame, createMockSetup } from './mocks';

// This file tests a full Mafia Game from start to finish
describe('game testing', () => {
  // @ts-ignore https://github.com/microsoft/TypeScript/issues/34933
  const game = createMockGame({
    numPlayers: 6,
    setup: createMockSetup({
      roles: ['Vanilla', 'Vanilla', 'Vanilla', 'Vanilla', 'Vanilla', 'Vanilla Mafia']
    })
  });

  test('basic variables', () => {
    expect(game.host.user.username).toBe('Player1');
    expect(game.channel.name).toBe('godfather-test');
    expect(game.majorityVotes).toBe(4);
    expect(game.players.length).toBe(6);
  });

  test('player manager', () => {
    const EXPECTED_PLAYERLIST = [
      '**Players: 6**',
      '1. Player1#0001 ',
      '2. Player2#0002 ',
      '3. Player3#0003 ',
      '4. Player4#0004 ',
      '5. Player5#0005 ',
      '6. Player6#0006 '
    ].join('\n');

    expect(game.players.show()).toBe(EXPECTED_PLAYERLIST);
  });

  test('starting days', async () => {
    await game.startDay();
    expect(game.phase).toBe(Phase.Day);
    expect(game.cycle).toBe(1);
    expect(game.channel.send).toHaveBeenNthCalledWith(1, ['Day **1** will last 5 minutes', 'With 6 alive, it takes 4 to eliminate.'].join('\n'));
    // check if the voting cache was successfully populated
    expect(game.votes.get(NotVoting)).toHaveLength(6);
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
      'Player2 (4): Player3, Player4, Player5, Player1 (Hammered)',
      'Not Voting (2): Player2, Player6'
    ].join('\n');

    expect(game.votes.show({})).toBe(EXPECTED_VOTE_COUNT);
  });

  test('hammering logic', async () => {
    await game.hammer(game.players[1]);
    expect(game.players[1].isAlive).toBe(false);
    expect(game.players[1].deathReason).toBe('eliminated D1');
    expect(game.channel.send).toHaveBeenNthCalledWith(
      2,
      [
        `Player2#0002 was hammered. They were a **Vanilla**. We could not find a will.`,
        `**Final Vote Count**`,
        '```',
        'Player2 (4): Player3, Player4, Player5, Player1 (Hammered)',
        'Not Voting (2): Player2, Player6',
        '```'
      ].join('\n')
    );
    expect(game.channel.send).toHaveBeenNthCalledWith(3, 'Night **1** will last 2 minutes. Send in your actions quickly!');
  });

  test('starting nights', () => {
    expect(game.phase).toBe(Phase.Night);
    expect(game.host.role!.canUseAction().check).toBe(false);
  });
});
