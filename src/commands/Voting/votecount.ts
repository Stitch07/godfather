import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { BucketType, CommandOptions } from '@sapphire/framework';
import type { Message, TextChannel } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['vc'],
	description: 'Shows the current vote count.',
	preconditions: [
		'GuildOnly',
		'GameOnly',
		'GameStartedOnly',
		'DayOnly',
		{ name: 'Cooldown', context: { bucketType: BucketType.Channel, delay: 5000 } }
	]
})
export default class extends GodfatherCommand {
	public async run(msg: Message) {
		const { game } = msg.channel as TextChannel;
		return msg.channel.send(game!.votes.show({}));
	}
}
