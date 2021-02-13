import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { BucketType, CommandOptions } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['players', 'pl'],
	description: 'commands/help:playerlistDescription',
	preconditions: ['GuildOnly', 'GameOnly', { name: 'Cooldown', context: { bucketType: BucketType.Channel, delay: Time.Second * 5 } }]
})
export default class extends GodfatherCommand {
	public run(message: Message) {
		const { game } = message.channel;
		return message.channel.send(game!.players.show());
	}
}
