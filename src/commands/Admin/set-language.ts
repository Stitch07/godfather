import type { Args, CommandContext, CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '@lib/GodfatherCommand';
import type { Message } from 'discord.js';
import { inlineCodeBlock } from '@sapphire/utilities';
import { DbSet } from '@root/lib/database/DbSet';

@ApplyOptions<CommandOptions>({
	preconditions: ['GuildOnly', ['AdminOnly', 'OwnerOnly']]
})
export default class extends GodfatherCommand {
	public async run(message: Message, args: Args, context: CommandContext) {
		if (args.finished) {
			const currentLocale = await message.fetchLanguage();
			return message.channel.send(
				[
					`The language in this server is set to **${currentLocale}**.`,
					`Use ${inlineCodeBlock('set-language <language>')} to update it.`,
					`Languages supported in Godfather: ${this.validLanguages.join(', ')}`
				].join('\n')
			);
		}

		const newLanguage = await args.pick('string');
		if (!this.validLanguages.includes(newLanguage))
			throw [`"${newLanguage}" is not a valid locale.`, `Languages supported in Godfather: ${this.validLanguages.join(', ')}`].join('\n');

		const { guilds } = await DbSet.connect();
		const guildSettings = await guilds.ensure(message.guild!);
		if (guildSettings.language === newLanguage) throw `The language in this server is already set to **${newLanguage}**.`;
		guildSettings.language = newLanguage;
		await guilds.save(guildSettings);

		return message.react('✅');
	}

	private get validLanguages() {
		return [...this.context.client.i18n.languages.keys()];
	}
}
