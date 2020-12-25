import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'Runs a connection test to Discord.'
})
export default class extends GodfatherCommand {

	public async run(message: Message) {
		const sent = await message.channel.send('Pinging...');
		const ping = sent.createdTimestamp - message.createdTimestamp;
		return sent.edit(`Pong! That took ${ping}ms. Latency: ${this.context.client.ws.ping}ms`);
	}

}
