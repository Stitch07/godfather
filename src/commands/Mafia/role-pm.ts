import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'Get your role PM.',
	generateDashLessAliases: true,
	preconditions: [
		'GuildOnly',
		'GameOnly',
		'PlayerOnly',
		'AlivePlayerOnly',
		'GameStartedOnly',
		{ name: 'Cooldown', context: { delay: 30 * Time.Second } }
	]
})
export default class extends GodfatherCommand {
	public async run(message: Message) {
		const player = message.channel.game!.players.get(message.author)!;
		try {
			await player.sendPM();
			await message.react('✅');
		} catch {
			throw await message.resolveKey('commands/mafia:rolepmFail');
		}
	}
}
