import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { BucketType, CommandOptions } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import type { Message, TextChannel } from 'discord.js';

@ApplyOptions<CommandOptions>({
  description: 'Remove your vote.',
  preconditions: [
    'GuildOnly',
    'GameOnly',
    'GameStartedOnly',
    'PlayerOnly',
    'AlivePlayerOnly',
    'GameStartedOnly',
    'DayOnly',
    { name: 'Cooldown', context: { bucketType: BucketType.Channel, delay: Number(Time.Second) } }
  ]
})
export default class extends GodfatherCommand {
  public async run(message: Message) {
    const { game } = message.channel as TextChannel;
    const voter = game!.players.get(message.author)!;
    const unvoted = game!.votes.unvote(voter);

    if (unvoted) {
      return message.react('✅');
    }
    return message.channel.send('No votes to remove!');
  }
}
