import { CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '#lib/GodfatherCommand';
import { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'Shows your will.',
	preconditions: ['DMOnly']
})
export default class extends GodfatherCommand {

	public async run(message: Message) {
		const game = this.context.client.games.find(game => Boolean(game.players.get(message.author)));
		if (!game) throw "You aren't in any active games!";

		if (game.settings.disableWills) throw 'Wills are disabled in this game.';
		if (!game.hasStarted) throw "The game hasn't started yet!";

		let player = game.players.get(message.author)!;

		if (!player.will.trim()) {
			return message.channel.send('You have not set a will yet.');
		}

		await message.channel.send(`Your will is:\n\`\`\`${player.will}\`\`\``);
	}

}
