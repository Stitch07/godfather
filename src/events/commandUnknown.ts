import type SingleTarget from '@mafia/mixins/SingleTarget';
import { Event, Events, PieceContext } from '@sapphire/framework';
import { fauxAlive } from '@util/utils';
import type { Message } from 'discord.js';

export default class extends Event<Events.UnknownCommand> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.UnknownCommand });
	}

	public async run(message: Message, _: string, prefix: string) {
		// actions are accepted in DMs only
		if (message.guild) return;

		const game = this.context.client.games.find((game) => Boolean(game.players.get(message.author)));
		if (!game || !game.hasStarted) return;

		const player = game.players.get(message.author)!;
		if (!fauxAlive(player) || !Reflect.has(player.role, 'action')) return;

		if ((player.role! as SingleTarget).actionPhase !== game.phase) return;
		const prefixLess = message.content.slice(prefix.length);
		const [commandText, ...parameters] = prefixLess.split(' ');
		try {
			await player.role!.onPmCommand(message, commandText.toLowerCase(), ...parameters);
		} catch (error) {
			if (typeof error === 'string') return message.channel.send(error);
			this.context.client.logger.error(error);
		}
	}
}
