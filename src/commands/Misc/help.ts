import GodfatherCommand from '@lib/GodfatherCommand';
import { SUPPORT_SERVER } from '@root/config';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args, CommandOptions, CommandStore } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'Shows you this command!',
	preconditions: []
})
export default class extends GodfatherCommand {
	private _commands!: CommandStore;

	public async run(message: Message, args: Args) {
		const t = await message.fetchT();
		const command = await args.pickResult('string');
		if (command.success) {
			if (!this._commands.has(command.value)) throw t('commands/misc:helpInvalidCommand');
			return message.channel.send(this.buildCommandHelp(this._commands.get(command.value) as GodfatherCommand));
		}

		// build a category -> command[] object
		const allCommands = this._commands.reduce((acc, cmd) => {
			const gCmd = cmd as GodfatherCommand;
			if (Reflect.has(acc, gCmd.category)) acc[gCmd.category].push(gCmd);
			else acc[gCmd.category] = [gCmd];
			return acc;
		}, {} as Record<string, GodfatherCommand[]>);

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

	public buildCommandHelp(command: GodfatherCommand) {
		return new MessageEmbed()
			.setColor('#000000')
			.setAuthor(this.context.client.user!.username, this.context.client.user!.displayAvatarURL())
			.addField([command.name, ...command.aliases].join('|'), command.description === '' ? 'No description available.' : command.description)
			.addField('Detailed Description', command.detailedDescription === '' ? 'No detailed description available' : command.detailedDescription);
	}

	public onLoad() {
		this._commands = this.context.client.stores.get('commands').filter((command) => (command as GodfatherCommand).category !== 'System');
	}
}
