import GodfatherCommand from '@lib/GodfatherCommand';
import { CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, TextChannel } from 'discord.js';

@ApplyOptions<CommandOptions>({
	preconditions: ['GuildOnly', 'GameOnly', 'PlayerOnly', 'AlivePlayerOnly']
})
export default class extends GodfatherCommand {

	public async run(msg: Message) {
		const { game } = msg.channel as TextChannel;
		if (await game!.players.remove(game!.players.get(msg.author)!)) {
			await msg.react('✅');
		}
		return [];
	}

}
