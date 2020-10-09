import { Branding } from '@lib/util/utils';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { roundNumber } from '@sapphire/utilities';
import { Message, MessageEmbed } from 'discord.js';
import { cpus } from 'os';

@ApplyOptions<CommandOptions>({
	description: 'Get an invite link to the bot and support server.'
})
export default class extends Command {

	public async run(message: Message) {
		return message.channel.send(await this.buildEmbed(message));
	}

	private async buildEmbed(message: Message) {
		const prefix = await this.client.fetchPrefix(message);
		const { generalStatistics, serverStatistics } = this;
		return new MessageEmbed()
			.setColor(Branding.PrimaryColor)
			.setAuthor(this.client.user!.username, this.client.user!.displayAvatarURL({ format: 'png' }))
			.setDescription(`To add ${this.client.user!.username} to your server, use the \`${prefix}invite\` command.`)
			.addField('Connected To', [
				`**Servers**: ${generalStatistics.guilds}`,
				`**Users**: ${generalStatistics.users}`,
				`**Channels**: ${generalStatistics.channels}`
			].join('\n'), true)
			.addField('Server Stats', [
				`**CPU Load**: ${serverStatistics.cpuLoad.map(load => `${load}%`).join(' | ')}`,
				`**RAM Used**: ${serverStatistics.ramUsed} (Total: ${serverStatistics.ramTotal})`
			].join('\n'), true);
	}

	private get generalStatistics() {
		return {
			guilds: this.client.guilds.cache.size.toLocaleString('en-US'),
			users: this.client.users.cache.size.toLocaleString('en-US'),
			channels: this.client.channels.cache.size.toLocaleString('en-US')
		};
	}

	private get serverStatistics() {
		const usage = process.memoryUsage();
		return {
			cpuLoad: cpus().map(({ times }) => roundNumber(((times.user + times.nice + times.sys + times.irq) / times.idle) * 10000) / 100),
			ramTotal: `${Math.round(100 * (usage.heapTotal / 1048576)) / 100}MB`,
			ramUsed: `${Math.round(100 * (usage.heapUsed / 1048576)) / 100}MB`
		};
	}

}
