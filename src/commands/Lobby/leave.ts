import GodfatherCommand from '@lib/GodfatherCommand';
import { CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	preconditions: ['GuildOnly', 'GameOnly', 'PlayerOnly', 'AlivePlayerOnly']
})
export default class extends GodfatherCommand {

	public async run(message: Message) {
		const { game } = message.channel;

		if (game!.players.replacements.includes(message.author)) {
			game!.players.replacements.splice(game!.players.replacements.indexOf(message.author));
			return message.channel.send('You are no longer a replacement.');
		}

		const player = game!.players.get(message.author);
		if (!player) throw "You aren't playing!";
		if (!player.isAlive) throw 'Dead players cannot leave the game.';

		if (await game!.players.remove(player)) {
			await message.react('✅');
			if (!game!.hasStarted) return;
			const winCheck = game!.checkEndgame();
			if (winCheck.ended) {
				return game!.end(winCheck);
			}
		}
	}

}
