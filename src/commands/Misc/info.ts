import GodfatherCommand from '@root/lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args, CommandContext, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'Shows you useful information about the bot.'
})
export default class extends GodfatherCommand {
	public async run(message: Message, _: Args, context: CommandContext) {
		const messageText = ((await message.resolveKey('commands/misc:infoText', { prefix: context.prefix })) as unknown) as string[];
		return message.channel.send(messageText.join('\n'));
	}
}
