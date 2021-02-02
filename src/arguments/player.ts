import Player from '@mafia/structures/Player';
import type Game from '@root/lib/mafia/structures/Game';
import { Argument, ArgumentContext, ArgumentStore, AsyncArgumentResult, Result, UserError } from '@sapphire/framework';
import type { User } from 'discord.js';

export default class extends Argument<Player> {
	public async run(parameter: string, context: PlayerArgumentContext): AsyncArgumentResult<Player> {
		const game = context.game ?? context.message.channel.game;

		const resolved = Player.resolve(game!, parameter);
		if (resolved) return this.ok(resolved);

		const user = (await ((this.store as unknown) as ArgumentStore).get('user')!.run(parameter, context)) as Result<User, UserError>;
		if (!user.success)
			return this.error({
				identifier: 'ArgumentPlayerUnknownUser',
				message: 'Invalid player mentioned.',
				parameter
			});
		const player = game!.players.get(user.value);

		if (player) return this.ok(player);
		return this.error({
			identifier: 'ArgumentPlayerInvalidPlayer',
			message: 'That user is not playing.',
			parameter
		});
	}
}

export interface PlayerArgumentContext extends ArgumentContext {
	game?: Game;
}
