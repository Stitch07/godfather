import GodfatherCommand from '@root/lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args, CommandContext, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'Shows you useful information about the bot.'
})
export default class extends GodfatherCommand {
	public async run(message: Message, _: Args, context: CommandContext) {
		const messageText = [
			`Godfather v${this.context.client.version} is a Discord Bot that hosts games of Werewolf/Mafia, with 24/7 uptime and intuitive commands.`,
			' ',
			'**Godfather features:**',
			'• Automatically hosted games of Mafia, with over 30 roles and different factions.',
			'• Addable custom setups',
			'• Player and game statistics',
			'and much more!',
			' ',
			`To add Godfather to your Discord server, use the \`${context.prefix}invite\` command.`
		];

		return message.channel.send(messageText.join('\n'));
	}
}
