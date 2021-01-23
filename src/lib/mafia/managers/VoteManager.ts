import Player from '@mafia/structures/Player';
import Game from '@mafia/structures/Game';
import { remove } from '@root/lib/util/utils';

export interface WeightedData {
	weight: number;
}

export interface Vote extends WeightedData {
	by: Player;
}

export enum TrialVoteType {
	Innocent,
	Guilty,
	Abstain
}

export interface TrialVote extends Vote {
	type: TrialVoteType;
}

export class WeightedArrayProxy<T extends WeightedData> extends Array<T> {

	// Flattens weighted votes and gives the number of actual votes on a player
	public count(): number {
		return this.reduce((acc, vote) => acc + vote.weight, 0);
	}

}

export class VoteProxy extends WeightedArrayProxy<Vote> {}

export const NotVoting = 'notVoting';
export const NoEliminate = 'noEliminate';

export default class VoteManager extends Map<string, VoteProxy> {

	public trialVotes: WeightedArrayProxy<TrialVote> = new WeightedArrayProxy();

	public playerOnTrial: Player | null = null;

	public constructor(public game: Game) {
		super();
		this.reset();
	}

	public trialVote(voter: Player, type: TrialVoteType) {
		if (voter.user.id === this.playerOnTrial!.user.id) throw "You're on trial, you can't vote!";
		if (!voter.isAlive) throw 'Dead players cannot vote in trials.';
		remove(this.trialVotes, vote => vote.by.user.id === voter.user.id);

		this.trialVotes.push({
			by: voter,
			type,
			weight: voter.role.voteWeight
		});

		return this.game.channel.send(`${voter} has voted.`);
	}

	public vote(voter: Player, target: Player): boolean {
		if (!target.isAlive) throw 'You can\'t vote a dead player.';
		const votes = this.on(target);
		if (voter === target) throw 'Self-voting is not allowed.';
		else if (votes.find(vote => vote.by === voter)) throw `You have already voted for ${target}`;
		// clear all other votes
		for (const votes of this.values()) {
			for (const vote of votes) if (vote.by === voter) votes.splice(votes.indexOf(vote), 1);
		}
		votes.push({
			by: voter,
			weight: voter.role!.voteWeight
		});
		this.set(target.user.id, votes);
		return this.on(target).count() >= this.game.majorityVotes;
	}

	public noEliminate(voter: Player): boolean {
		const votes = this.get(NoEliminate) ?? new VoteProxy();
		if (votes.find(vote => vote.by === voter)) throw 'You have already voted not to eliminate.';
		// clear all other votes
		for (const votes of this.values()) {
			for (const vote of votes) if (vote.by === voter) votes.splice(votes.indexOf(vote), 1);
		}
		votes.push({
			by: voter,
			weight: voter.role!.voteWeight
		});
		this.set(NoEliminate, votes);
		return this.get(NoEliminate)!.count() >= this.game.majorityVotes;
	}

	public unvote(voter: Player) {
		for (const [target, votes] of this) {
			if (target === NotVoting || !votes.find(vote => vote.by === voter)) continue;
			votes.splice(votes.findIndex(vote => vote.by === voter), 1);
			this.get(NotVoting)!.push({ by: voter, weight: 1 });
			return true;
		}
		return false;
	}

	public show({ header = 'Vote Count', codeblock = false }): string {
		const voteText = [`**${header}**`];
		if (codeblock) voteText.push('```');

		const sortedVotes = Array.from(this.entries()).filter(votes => votes[0] !== NotVoting).sort((a, b) => a[1].count() - b[1].count());
		for (const [targetID, votes] of sortedVotes) {
			if (votes.count() === 0) continue;
			const target = this.game.players.find(player => player.user.id === targetID);
			if (!target) continue;
			voteText.push(`${target.user.username} (${votes.count()}): ${votes.map(voterMapping).join(', ')} ${votes.count() >= this.game.majorityVotes ? '(Hammered)' : ''}`);
		}

		const noElims = this.get(NoEliminate);
		if (noElims && noElims.count() > 0) {
			voteText.push(`No Eliminations (${noElims!.count()}): ${noElims!.map(voterMapping).join(', ')}`);
		}

		const notVoting = this.get(NotVoting);
		if (notVoting && notVoting.count() > 0) {
			voteText.push(`Not Voting (${notVoting!.count()}): ${notVoting!.map(voterMapping).join(', ')}`);
		}

		if (codeblock) voteText.push('```');

		return voteText.join('\n');
	}

	public on(player: Player) {
		return this.get(player.user.id) ?? new VoteProxy();
	}

	public reset() {
		this.clear();
		this.set(NotVoting, new VoteProxy());
		this.set(NotVoting, new VoteProxy());
		this.trialVotes = new WeightedArrayProxy<TrialVote>();
		this.playerOnTrial = null;

		// populate voting cache
		const alivePlayers = this.game.players.filter(player => player.isAlive);
		for (const alivePlayer of alivePlayers) {
			this.get(NotVoting)!.push({ by: alivePlayer, weight: 1 });
		}
	}

}

const voterMapping = (vote: Vote) => {
	let text = `${vote.by.user.username}`;
	if (vote.weight > 1) text += ` (${vote.weight}x)`;
	return text;
};
