import { Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class extends Precondition {
	public async run(message: Message) {
		return message.guild && message.channel.game?.hasStarted ? this.ok() : this.error({ message: "The game hasn't started yet." });
	}
}
