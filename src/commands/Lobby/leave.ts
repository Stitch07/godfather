import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['out'],
	description: 'commands/help:leaveDescription',
	detailedDescription: 'commands/help:leaveDetailed',
	preconditions: ['GuildOnly', 'GameOnly']
})
export default class extends GodfatherCommand {
	public async run(message: Message) {
		const { game } = message.channel;

		if (game!.players.replacements.includes(message.author)) {
			game!.players.replacements.splice(game!.players.replacements.indexOf(message.author));
			return message.channel.sendTranslated('commands/lobby:leaveReplacement');
		}

		const player = game!.players.get(message.author);
		if (!player) throw await message.resolveKey('commands/lobby:leaveNotPlaying');
		if (!player.isAlive) throw await message.resolveKey('commands/lobby:leavePlayerDead');

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
