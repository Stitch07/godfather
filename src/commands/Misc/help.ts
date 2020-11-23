import { Args, CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';
import GodfatherCommand from '@lib/GodfatherCommand';
import { Branding } from '@util/utils';
import { SUPPORT_SERVER } from '@root/config';

@ApplyOptions<CommandOptions>({
	preconditions: []
})
export default class extends GodfatherCommand {

	public async run(message: Message, args: Args) {
		const command = await args.pickResult('string');
		if (command.success) {
			if (!this._commands.has(command.value)) throw 'Invalid command provided.';
			return message.channel.send(this.buildCommandHelp(this._commands.get(command.value) as GodfatherCommand));
		}

		// build a category -> command[] object
		const allCommands = this._commands
			.reduce((acc, cmd) => {
				const gCmd = cmd as GodfatherCommand;
				if (Reflect.has(acc, gCmd.category)) acc[gCmd.category].push(gCmd);
				else acc[gCmd.category] = [gCmd];
				return acc;
			}, {} as Record<string, GodfatherCommand[]>);

		const prefix = await this.client.fetchPrefix(message);

		const embed = new MessageEmbed()
			.setColor(Branding.PrimaryColor)
			.setAuthor(this.client.user!.username, this.client.user!.displayAvatarURL())
			.setDescription([
				`A Discord Bot that automatically hosts games of Mafia. My prefix here is \`${Array.isArray(prefix) ? prefix[0] : prefix}\``,
				`[Support Server](${SUPPORT_SERVER})`
			].join('\n'))
			.setFooter(`For information about a specific command, run ${prefix}help <command>.`);

		for (const [category, commands] of Object.entries(allCommands)) {
			embed.addField(category, commands.map(cmd => cmd.name).join(', '));
		}

		return message.channel.send(embed);
	}

	public buildCommandHelp(command: GodfatherCommand) {
		return new MessageEmbed()
			.setColor(Branding.PrimaryColor)
			.setAuthor(this.client.user!.username, this.client.user!.displayAvatarURL())
			.addField(command.name, command.description === '' ? 'No description available.' : command.description)
			.addField('Detailed Description', command.detailedDescription === '' ? 'No detailed description available' : command.detailedDescription);
	}

	private get _commands() {
		return this.client.commands.filter(command => (command as GodfatherCommand).category !== 'System');
	}

}
