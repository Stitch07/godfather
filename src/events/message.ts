import { Event, Events, PieceContext } from '@sapphire/framework';
import { Message } from 'discord.js';

export default class extends Event<Events.Message> {

	public constructor(context: PieceContext) {
		super(context, { event: Events.Message });
	}

	public async run(message: Message) {
		if (message.content.replace('!', '') === this.client.user!.toString()) {
			const prefix = await this.client.fetchPrefix(message);
			await message.channel.send(`My prefix in this server is set to: \`${prefix}\``);
		}
	}

}
