import Player from '@mafia/structures/Player';
import Game from '@root/lib/mafia/structures/Game';
import { Argument, ArgumentContext, ArgumentStore, AsyncArgumentResult, Result, UserError } from '@sapphire/framework';
import { User } from 'discord.js';

export default class extends Argument<Player> {

	public async run(argument: string, context: PlayerArgumentContext): AsyncArgumentResult<Player> {
		const game = context.game ?? context.message.channel.game;

		const resolved = Player.resolve(game!, argument);
		if (resolved) return this.ok(resolved);

		const user = await (this.store as unknown as ArgumentStore).get('user')!.run(argument, context) as Result<User, UserError>;
		if (!user.success) return this.error(argument, 'ArgumentPlayerUnknownUser', 'Invalid player mentioned.');
		const player = game!.players.get(user.value);

		if (player) return this.ok(player);
		return this.error(argument, 'ArgumentPlayerInvalidPlayer', 'Invalid player.');
	}

}

export interface PlayerArgumentContext extends ArgumentContext {
	game?: Game;
}
