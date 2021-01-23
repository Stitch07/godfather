import GodfatherCommand from '@lib/GodfatherCommand';
import { TrialVoteType } from '@root/lib/mafia/managers/VoteManager';
import { ApplyOptions } from '@sapphire/decorators';
import { BucketType, CommandOptions } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
  preconditions: ['TrialVotingOnly', { name: 'Cooldown', context: { bucketType: BucketType.User, delay: Number(Time.Second) } }]
})
export default class extends GodfatherCommand {
  public async run(message: Message) {
    const game = this.context.client.games.find((game) => Boolean(game.players.get(message.author)))!;
    await game.votes.trialVote(game.players.get(message.author)!, TrialVoteType.Abstain).then(() => message.react('✅'));
  }
}
