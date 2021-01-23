import { Phase } from '@mafia/structures/Game';
import { Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class extends Precondition {
	public run(message: Message) {
		const { game } = message.channel;
		if (game && game.phase === Phase.Day) return this.ok();
		return this.error('This command cannot be used at night or during trials.');
	}
}
