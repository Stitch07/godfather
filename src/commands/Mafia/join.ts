import { ApplyOptions } from '@util/utils';
import Player from '@mafia/Player';
import { Message, TextChannel } from 'discord.js';
import { Command, CommandOptions } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
	aliases: ['in'],
	description: 'Adds you to the playerlist of an ongoing game.',
	preconditions: ['GuildOnly', 'GameOnly']
})
export default class extends Command {

	public run(msg: Message) {
		const { game } = msg.channel as TextChannel;
		if (game!.players.find(player => player.user.id === msg.author.id)) {
			throw 'You have already joined.';
		}
		if (game!.hasStarted) {
			// do replacements here sometime
		}
		game!.players.push(new Player(msg.author, game!));
		return msg.channel.send('✅ Successfully joined.');
	}

}
