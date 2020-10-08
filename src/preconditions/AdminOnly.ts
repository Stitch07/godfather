import { Precondition } from '@sapphire/framework';
import { Message, Permissions } from 'discord.js';

export default class extends Precondition {

	public run(message: Message) {
		if (message.guild && message.member!.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return this.ok();
		// TODO: remove this later
		if (message.author.id === this.client.ownerID) return this.ok();
		return this.error(this.name, 'This command can only be used by server admins.');
	}

}
