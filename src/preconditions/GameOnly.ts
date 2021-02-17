import { Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class extends Precondition {
	public async run(message: Message) {
		const prefix = await this.context.client.fetchPrefix(message);
		return message.guild && message.channel.game ? this.ok() : this.error({ context: { prefix } });
	}
}
