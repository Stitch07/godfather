import Player from '@mafia/Player';
import Game from '@mafia/Game';

export interface Vote {
	by: Player;
	weight: number;
}

export class VoteProxy extends Array<Vote> {

	// Flattens weighted votes and gives the number of actual votes on a player
	public count(): number {
		return this.reduce((acc, vote) => acc + vote.weight, 0);
	}

}

export const NotVoting = 'notVoting';
export const NoLynch = 'noLynch';

export default class VoteManager extends Map<string, VoteProxy> {

	public constructor(public game: Game) {
		super();
		this.reset();
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

	public noLynch(voter: Player): boolean {
		const votes = this.get(NoLynch) ?? new VoteProxy();
		if (votes.find(vote => vote.by === voter)) throw 'You have already voted to no-lynch.';
		// clear all other votes
		for (const votes of this.values()) {
			for (const vote of votes) if (vote.by === voter) votes.splice(votes.indexOf(vote), 1);
		}
		votes.push({
			by: voter,
			weight: voter.role!.voteWeight
		});
		this.set(NoLynch, votes);
		return this.get(NoLynch)!.count() >= this.game.majorityVotes;
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
			voteText.push(`${target.user.username} (${votes.count()}): ${votes.map(voterMapping).join(', ')} ${votes.length === this.game.majorityVotes ? '(Hammered)' : ''}`);
		}

		const notVoting = this.get(NotVoting);
		if (notVoting!.count() > 0) {
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
