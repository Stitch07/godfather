import { Command, Event, Events, PieceContext } from '@sapphire/framework';
import { Message } from 'discord.js';

export default class extends Event<Events.CommandSuccess> {

	public constructor(context: PieceContext) {
		super(context, { event: Events.CommandSuccess });
	}

	public run(message: Message, command: Command) {
		const guildName = message.guild ? `${message.guild.name}[${message.guild.id}]` : 'Direct Messages';
		this.client.logger.info(`${command.name} used by ${message.author.tag}(${message.author.id}) in ${guildName}.`);
	}

}
