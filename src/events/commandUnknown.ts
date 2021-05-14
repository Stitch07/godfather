import { ActionRole } from '@root/lib/mafia/structures/ActionRole';
import { Event, Events, PieceContext, UnknownCommandPayload } from '@sapphire/framework';
import { fauxAlive } from '@util/utils';

export default class extends Event<Events.UnknownCommand> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.UnknownCommand });
	}

	public async run({ message, commandPrefix }: UnknownCommandPayload) {
		// actions are accepted in DMs only
		if (message.guild) return;

		const game = this.context.client.games.find((game) => Boolean(game.players.get(message.author)));
		if (!game || !game.hasStarted) return;

		const player = game.players.get(message.author)!;
		if (!(player.role instanceof ActionRole) || !fauxAlive(player)) return;

		// checks for a bitwise AND so that action phases can be aggregated using bitwise AND
		// for example, an actionPhase set to Day | Night will work in both of those phases
		// if ((player.role.actionPhase & game.phase) !== game.phase) return;
		const prefixLess = message.content.slice(commandPrefix.length);
		const [commandText, ...parameters] = prefixLess.split(' ');
		try {
			await player.role!.onPmCommand(message, commandText.toLowerCase(), ...parameters);
		} catch (error) {
			if (typeof error === 'string') return message.channel.send(error);
			this.context.client.logger.error(error);
		}
	}
}
