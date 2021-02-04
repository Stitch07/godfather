import { DbSet } from '@lib/database/DbSet';
import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args, CommandContext, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['language', 'lang', 'set-lang', 'setlang'],
	preconditions: ['GuildOnly', ['AdminOnly', 'OwnerOnly']]
})
export default class extends GodfatherCommand {
	public async run(message: Message, args: Args, context: CommandContext) {
		if (args.finished) {
			const t = await message.fetchT();
			const output = (t('commands/admin:setLanguageView', {
				currentLanguage: t.lng,
				validLanguages: this.validLanguages
			}) as unknown) as string[];
			return message.channel.send(output.join('\n'));
		}

		const newLanguage = await args.pick('string');
		if (!this.validLanguages.includes(newLanguage))
			return message.channel.sendTranslated('commands/admin:setLanguageInvalidLocale', [
				{
					locale: newLanguage,
					validLanguages: this.validLanguages
				}
			]);

		const { guilds } = await DbSet.connect();
		const guildSettings = await guilds.ensure(message.guild!);
		if (guildSettings.language === newLanguage) throw await message.resolveKey('commands/admin:setLanguageAlreadySet', { locale: newLanguage });
		guildSettings.language = newLanguage;
		await guilds.save(guildSettings);

		return message.react('✅');
	}

	private get validLanguages() {
		return [...this.context.client.i18n.languages.keys()];
	}
}
