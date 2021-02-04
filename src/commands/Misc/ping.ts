import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'Runs a connection test to Discord.'
})
export default class extends GodfatherCommand {
	public async run(message: Message) {
		const t = await message.fetchT();
		const sent = await message.channel.send(t('commands/misc:pingInitial'));
		const ping = sent.createdTimestamp - message.createdTimestamp;
		return sent.edit(t('commands/misc:pingResponse', { ping, latency: this.context.client.ws.ping }));
	}
}
