import { ApplyOptions } from '@util/utils';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message, TextChannel } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['vc'],
	description: 'Shows the current vote count.',
	preconditions: ['GuildOnly', 'GameOnly']
})
export default class extends Command {

	public async run(msg: Message) {
		const { game } = msg.channel as TextChannel;
		return msg.channel.send(game!.votes.show());
	}

}
