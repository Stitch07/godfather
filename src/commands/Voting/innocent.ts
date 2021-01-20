import { BucketType, CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '@lib/GodfatherCommand';
import { Message } from 'discord.js';
import { TrialVoteType } from '@root/lib/mafia/managers/VoteManager';
import { Time } from '@sapphire/time-utilities';

@ApplyOptions<CommandOptions>({
	aliases: ['inno'],
	preconditions: ['TrialVotingOnly', { name: 'Cooldown', context: { bucketType: BucketType.User, delay: Number(Time.Second) } }]
})
export default class extends GodfatherCommand {

	public async run(message: Message) {
		const game = this.context.client.games.find(game => Boolean(game.players.get(message.author)))!;
		await game.votes.trialVote(game.players.get(message.author)!, TrialVoteType.Innocent).then(() => message.react('✅'));
	}

}
