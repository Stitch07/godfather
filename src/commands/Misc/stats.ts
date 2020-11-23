import GodfatherCommand from '@lib/GodfatherCommand';
import { Branding } from '@util/utils';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptions } from '@sapphire/framework';
import { roundNumber } from '@sapphire/utilities';
import { Message, MessageEmbed } from 'discord.js';
import { cpus } from 'os';
import { format } from '@util/durationFormat';

@ApplyOptions<CommandOptions>({
	description: 'Get an invite link to the bot and support server.'
})
export default class extends GodfatherCommand {

	public async run(message: Message) {
		return message.channel.send(await this.buildEmbed(message));
	}

	private async buildEmbed(message: Message) {
		const prefix = await this.client.fetchPrefix(message);
		const { generalStatistics, serverStatistics } = this;
		return new MessageEmbed()
			.setColor(Branding.PrimaryColor)
			.setAuthor(this.client.user!.username, this.client.user!.displayAvatarURL({ format: 'png' }))
			.setDescription(`To add ${this.client.user!.username} to your server, use the \`${Array.isArray(prefix) ? prefix[0] : prefix}invite\` command.`)
			.addField('Connected To', [
				`**Servers**: ${generalStatistics.guilds}`,
				`**Users**: ${generalStatistics.members}`,
				`**Channels**: ${generalStatistics.channels}`
			].join('\n'), true)
			.addField('Server Stats', [
				`**CPU Load**: ${serverStatistics.cpuLoad.map(load => `${load}%`).join(' | ')}`,
				`**RAM Used**: ${serverStatistics.ramUsed} (Total: ${serverStatistics.ramTotal})`,
				`**Uptime**: ${format(this.client.uptime ?? 0)}`
			].join('\n'), true);
	}

	private get generalStatistics() {
		return {
			guilds: this.client.guilds.cache.size.toLocaleString('en-US'),
			// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
			members: this.client.guilds.cache.reduce((a, b) => b.memberCount + a, 0).toLocaleString('en-US'),
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
