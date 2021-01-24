import { Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class extends Precondition {
	public async run(message: Message) {
		return this.context.client.ownerID === message.author.id ? this.ok() : this.error(this.name, 'This command can only be used by the owner.');
	}
}
