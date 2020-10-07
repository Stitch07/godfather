import { Command, CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@util/utils';
import { Message, TextChannel } from 'discord.js';

@ApplyOptions<CommandOptions>({
	preconditions: ['GuildOnly', 'GameOnly', 'PlayerOnly', 'AlivePlayerOnly']
})
export default class extends Command {

	public async run(msg: Message) {
		const { game } = msg.channel as TextChannel;
		if (await game!.players.remove(game!.players.get(msg.author)!)) {
			await msg.reactions.add('✅');
		}
		return [];
	}

}
