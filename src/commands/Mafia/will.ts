import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['setwill'],
	description: 'Sets given message as your will.',
	preconditions: ['DMOnly']
})
export default class extends GodfatherCommand {
	public async run(message: Message, args: Args) {
		const game = this.context.client.games.find((game) => Boolean(game.players.get(message.author)));
		if (!game) throw "You aren't in any active games!";

		if (game.settings.disableWills) throw 'Wills are disabled in this game.';
		if (!game.hasStarted) throw "The game hasn't started yet!";

		const player = game.players.get(message.author)!;
		if (!player.isAlive) throw 'You cannot set a will as a dead player.';

		const will = await args.rest('string', { maximum: 400 }).catch(() => {
			throw 'Missing required argument: will';
		});

		if (will.split('\n').length > 8) throw 'Wills cannot be more than 8 lines.';
		player.will = will;

		await message.channel.send('Your will has been set.');
	}
}
