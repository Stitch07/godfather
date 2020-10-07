import { Precondition } from '@sapphire/framework';
import { Message } from 'discord.js';

export default class extends Precondition {

	public async run(message: Message) {
		return this.client.ownerID === message.author.id
			? this.ok()
			: this.error(this.name, 'This command can only be used by the owner.');
	}

}
