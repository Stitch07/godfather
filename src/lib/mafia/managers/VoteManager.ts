import type { Game } from "#mafia/structures/Game";
import type { Player } from "#mafia/structures/Player";

export interface WeightedData {
  weight: number;
}

export interface Vote extends WeightedData {
  by: Player<any>;
}

export class WeightedArrayProxy<T extends WeightedData> extends Array<T> {
  // Flattens weighted votes and gives the number of actual votes on a player
  public count(): number {
    return this.reduce((acc, vote) => acc + vote.weight, 0);
  }
}

export class VoteProxy extends WeightedArrayProxy<Vote> {}

export const NotVoting = "notVoting";
export const NoEliminate = "noEliminate";

export class VoteManager extends Map<string, VoteProxy> {
  public constructor(public game: Game<any, any>) {
    super();
    this.reset();
  }

  public vote(voter: Player<any>, target: Player<any>) {
    const votes = this.on(target);
    for (const votes of this.values()) {
      for (const vote of votes)
        if (vote.by === voter) votes.splice(votes.indexOf(vote), 1);
    }
    votes.push({
      by: voter,
      weight: voter.role!.voteWeight,
    });
    this.set(target.user.id, votes);
    return this.on(target).count() >= this.game.majorityVotes;
  }

  public on(player: Player<any>) {
    return this.get(player.user.id) ?? new VoteProxy();
  }

  public reset() {
    this.clear();
    this.set(NotVoting, new VoteProxy());
    this.set(NoEliminate, new VoteProxy());

    // populate not-voting cache
    const alivePlayers = this.game.players.filter((player) => player.isAlive);
    for (const alivePlayer of alivePlayers) {
      this.get(NotVoting)!.push({ by: alivePlayer, weight: 1 });
    }
  }
}
