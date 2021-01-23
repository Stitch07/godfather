import { Precondition } from '@sapphire/framework';
import type { Message, TextChannel } from 'discord.js';

export default class extends Precondition {
	public async run(message: Message) {
		const { game } = message.channel as TextChannel;
		const player = game?.players.get(message.author);

		if (player && player.isAlive) return this.ok();
		return this.error(this.name, 'This command can only be used by alive players.');
	}
}
