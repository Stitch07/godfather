import Player from '@mafia/Player';
import Game from '@mafia/Game';

export interface Vote {
	by: Player;
	weight?: number;
}

export class VoteProxy extends Array<Vote> {

	// Flattens weighted votes and gives the number of actual votes on an Array<Vote
	public count(): number {
		return this.reduce((acc, vote) => acc + (vote.weight ?? 1), 0);
	}

}

export const notVoting = 'notVoting';
export const noLynch = 'noLynch';

export default class VoteManager extends Map<string, VoteProxy> {

	public constructor(public game: Game) {
		super();
		// special keys for not voting and no lynch.
		this.set(notVoting, new VoteProxy());
		this.set(noLynch, new VoteProxy());
	}

	public vote(voter: Player, target: Player, weight = 1): boolean {
		if (!target.isAlive) throw 'You can\'t vote a dead player.';
		const votes = this.on(voter);
		if (voter === target) throw 'Self-voting is not allowed.';
		else if (votes.find(vote => vote.by === voter)) throw `You have already voted for ${target}`;
		// clear all other votes
		for (const votes of this.values()) {
			for (const [n, vote] of votes.entries()) if (vote.by === voter) delete votes[n];
		}
		votes.push({
			by: voter,
			weight
		});
		this.set(target.user.id, votes);
		return this.on(voter).count() >= this.game.majorityVotes;
	}

	public noLynch(voter: Player, weight = 1): boolean {
		const votes = this.on(voter);
		if (votes.find(vote => vote.by === voter)) throw 'You have already voted to no-lynch.';
		// clear all other votes
		for (const votes of this.values()) {
			for (const [n, vote] of votes.entries()) if (vote.by === voter) delete votes[n];
		}
		votes.push({
			by: voter,
			weight
		});
		this.set(noLynch, votes);
		return this.on(voter).count() >= this.game.majorityVotes;
	}

	public on(player: Player) {
		return this.get(player.user.id) ?? new VoteProxy();
	}

	public reset() {
		this.clear();
		this.set(notVoting, new VoteProxy());
		this.set(noLynch, new VoteProxy());
	}

}
