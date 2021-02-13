import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['del', 'delete-game'],
	generateDashLessAliases: true,
	description: 'commands/help:deleteDescription',
	preconditions: ['GuildOnly', 'GameOnly', ['AdminOnly', 'HostOnly']]
})
export default class extends GodfatherCommand {
	public async run(message: Message) {
		const { game } = message.channel;
		if (game!.hasStarted) {
			const confirmation = await message.prompt(game!.t('commands/lobby:deleteConfirmation'));
			if (!confirmation) return message.react('❌');
		}

		await game!.delete();
		return message.react('✅');
	}
}
