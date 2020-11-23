import { Precondition } from '@sapphire/framework';
import { Message } from 'discord.js';

export default class extends Precondition {

	public async run(message: Message) {
		return (message.guild && message.channel.game?.hasStarted)
			? this.ok()
			: this.error(this.name, "The game hasn't started yet.");
	}

}
