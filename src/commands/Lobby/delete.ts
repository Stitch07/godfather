import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['del', 'deletegame'],
	description: 'Deletes an ongoing game.',
	preconditions: ['GuildOnly', 'GameOnly', ['AdminOnly', 'HostOnly']]
})
export default class extends GodfatherCommand {
	public async run(message: Message) {
		const { game } = message.channel;
		if (game!.hasStarted) {
			const confirmation = await message.prompt('Are you sure you want to delete this game?');
			if (!confirmation) return message.react('❌');
		}

		await game!.delete();
		return message.react('✅');
	}
}
