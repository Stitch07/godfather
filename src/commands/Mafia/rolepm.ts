import { CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '@lib/GodfatherCommand';
import { Message } from 'discord.js';
import { Time } from '@sapphire/time-utilities';

@ApplyOptions<CommandOptions>({
	description: 'Get your role PM.',
	preconditions: ['GuildOnly', 'GameOnly', 'PlayerOnly', 'AlivePlayerOnly', 'GameStartedOnly', { name: 'Cooldown', context: { delay: 30 * Time.Second } }]
})
export default class extends GodfatherCommand {

	public async run(message: Message) {
		const player = message.channel.game!.players.get(message.author)!;
		try {
			await player.sendPM();
			await message.react('✅');
		} catch {
			throw "I couldn't DM you! Enable your DMs and run this command again.";
		}
	}

}
