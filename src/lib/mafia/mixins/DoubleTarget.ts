import type Game from '../structures/Game';
import Player from '../structures/Player';
import SingleTarget from './SingleTarget';

export default class DoubleTarget extends SingleTarget {
  public getTarget(args: string[], game: Game): Player[] {
    args = args.slice(0, 2);
    if (args.length < 2) throw 'You have to specify 2 targets.';

    const targets = args.map((arg) => Player.resolve(game, arg)).filter((target) => target !== null) as Player[];
    if (targets.length !== 2) throw `Invalid target. Choose a number between 1 and ${game.players.length}`;
    return targets;
  }

  public canTarget(target: Player[]) {
    if (target[0] === target[1]) return { check: false, reason: `Pick 2 distinct targets.` };
    if (target.some((player) => !player.isAlive)) return { check: false, reason: 'You cannot target dead players.' };
    return { check: true, reason: '' };
  }
}
