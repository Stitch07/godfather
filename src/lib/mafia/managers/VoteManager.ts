import Player from '@mafia/Player';
import Game from '@mafia/Game';

export interface Vote {
	by: Player;
	weight?: number;
}

export const notVoting = 'notVoting';
export const noLynch = 'noLynch';

export default class VoteManager extends Map<string, Array<Vote>> {

	public constructor(public game: Game) {
		super();
		// special keys for not voting and no lynch.
		this.set(notVoting, []);
		this.set(noLynch, []);
	}

	public vote(voter: Player, target: Player, weight = 1): boolean {
		if (!target.isAlive) throw 'You can\'t vote a dead player.';
		const votes = this.get(voter.user.id) ?? [];
		if (voter === target) throw 'Self-voting is not allowed.';
		else if (votes.find(vote => vote.by === voter)) throw `You have already voted for ${target}`;
		// clear all other votes
		for (let votes of this.values()) {
			votes = votes.filter(vote => vote.by !== voter);
		}
		votes.push({
			by: voter,
			weight
		});
		this.set(target.user.id, votes);
		return this.votesOnPlayer(votes) >= this.game.majorityVotes;
	}

	public noLynch(voter: Player, weight = 1): boolean {
		const votes = this.get(noLynch) ?? [];
		if (votes.find(vote => vote.by === voter)) throw 'You have already voted to no-lynch.';
		// clear all other votes
		for (let votes of this.values()) {
			votes = votes.filter(vote => vote.by !== voter);
		}
		votes.push({
			by: voter,
			weight
		});
		this.set(noLynch, votes);
		return this.votesOnPlayer(votes) >= this.game.majorityVotes;
	}

	// Flattens weighted votes and gives the number of actual votes on an Array<Vote>
	private votesOnPlayer(votes: Array<Vote>) {
		return votes.reduce((acc, vote) => acc + (vote.weight ?? 1), 0);
	}

}
