import { Args, CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '@lib/GodfatherCommand';
import { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'Sets given message as your will.',
	preconditions: ['DMOnly']
})
export default class extends GodfatherCommand {

	public async run(message: Message, args: Args) {
		const game = this.context.client.games.find(game => Boolean(game.players.get(message.author)));
		if (!game) throw "You aren't in any active games!";

		if (game.settings.disableWills) throw 'Wills are disabled in this game.';
		if (!game.hasStarted) throw "The game hasn't started yet!";

		let player = game.players.get(message.author)!;

		const will = await args.rest('string')
			.catch(() => { throw 'Missing required argument: will'; });

		if (will.length > 400) throw 'Wills must be at most 400 characters.';

		if (will.split('\n').length > 8) throw 'Wills must be at most 8 lines.';

		player.will = will;

		await message.channel.send('Set that as your will.');
	}

}
