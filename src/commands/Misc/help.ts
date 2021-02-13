import GodfatherCommand from '@lib/GodfatherCommand';
import { SUPPORT_SERVER } from '@root/config';
import { LanguageHelp, LanguageHelpDisplayOptions } from '@root/lib/i18n/structures/LanguageHelp';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args, Command, CommandContext, CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<CommandOptions>({
	description: 'Shows you this command!',
	preconditions: []
})
export default class extends GodfatherCommand {
	public async run(message: Message, args: Args, context: CommandContext) {
		const t = await message.fetchT();
		const command = await args.pickResult('string');
		const commands = this.context.stores.get('commands');

		if (command.success) {
			if (!commands.has(command.value) || commands.get(command.value)!.category === 'System') throw t('commands/misc:helpInvalidCommand');
			return message.channel.send(
				this.buildCommandHelp(t, commands.get(command.value) as GodfatherCommand, (await this.context.client.fetchPrefix(message)) as string)
			);
		}

		// build a category -> command[] object
		const allCommands = commands.reduce((acc, cmd) => {
			if (cmd.category === 'System') return acc;
			if (Reflect.has(acc, cmd.category)) acc[cmd.category].push(cmd);
			else acc[cmd.category] = [cmd];
			return acc;
		}, {} as Record<string, Command[]>);

		const prefix = await this.context.client.fetchPrefix(message);

		const embed = new MessageEmbed()
			.setColor('#000000')
			.setAuthor(this.context.client.user!.username, this.context.client.user!.displayAvatarURL())
			.setDescription(((t('commands/misc:helpDescription', { prefix, supportServer: SUPPORT_SERVER }) as unknown) as string[]).join('\n'))
			.setFooter(t('commands/misc:helpFooter', { prefix }));

		for (const [category, commands] of Object.entries(allCommands)) {
			embed.addField(category, commands.map((cmd) => cmd.name).join(', '));
		}

		return message.channel.send(embed);
	}

	public buildCommandHelp(t: TFunction, command: GodfatherCommand, prefix: string) {
		const builderData = (t('globals:helpTitles') as unknown) as {
			aliases: string;
			extendedHelp: string;
			examples: string;
			usages: string;
			reminder: string;
		};

		const languageBuilder = new LanguageHelp()
			.setAliases(builderData.aliases)
			.setExamples(builderData.examples)
			.setExtendedHelp(builderData.extendedHelp)
			.setUsages(builderData.usages)
			.setReminder(builderData.reminder);
		const helpData = (t(command.detailedDescription, { prefix }) as unknown) as LanguageHelpDisplayOptions;
		const extendedHelp = languageBuilder.display(command.name, this.formatAliases(command.aliases, t), helpData, prefix);

		return new MessageEmbed()
			.setColor('#000000')
			.setAuthor(this.context.client.user!.username, this.context.client.user!.displayAvatarURL())
			.setTitle(t(command.description))
			.setDescription(extendedHelp);
	}

	private formatAliases(aliases: readonly string[], t: TFunction) {
		return aliases.length === 0 ? null : t('globals:listAnd', { value: aliases });
	}
}
