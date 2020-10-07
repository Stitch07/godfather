import { Precondition } from '@sapphire/framework';
import { Message, TextChannel } from 'discord.js';

export default class extends Precondition {

	public async run(message: Message) {
		return (message.guild && (message.channel as TextChannel).game)
			? this.ok()
			: this.error(this.name, `A game of Mafia is not running in this channel.`);
	}

}
