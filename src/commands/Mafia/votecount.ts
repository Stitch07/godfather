import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptions } from '@sapphire/framework';
import { Message, TextChannel } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['vc'],
	description: 'Shows the current vote count.',
	preconditions: ['GuildOnly', 'GameOnly']
})
export default class extends GodfatherCommand {

	public async run(msg: Message) {
		const { game } = msg.channel as TextChannel;
		return msg.channel.send(game!.votes.show());
	}

}
