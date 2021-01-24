import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptions, PermissionsPrecondition } from '@sapphire/framework';
import { roundNumber } from '@sapphire/utilities';
import { format } from '@util/durationFormat';
import { Branding } from '@util/utils';
import { Message, MessageEmbed } from 'discord.js';
import { cpus } from 'os';

@ApplyOptions<CommandOptions>({
	description: 'View bot statistics',
	preconditions: [new PermissionsPrecondition('EMBED_LINKS')]
})
export default class extends GodfatherCommand {
	public async run(message: Message) {
		return message.channel.send(await this.buildEmbed(message));
	}

	private async buildEmbed(message: Message) {
		const prefix = await this.context.client.fetchPrefix(message);
		const { generalStatistics, serverStatistics } = this;
		return new MessageEmbed()
			.setColor(Branding.PrimaryColor)
			.setAuthor(this.context.client.user!.username, this.context.client.user!.displayAvatarURL({ format: 'png' }))
			.setDescription(
				`To add ${this.context.client.user!.username} to your server, use the \`${
					Array.isArray(prefix) ? prefix[0] : prefix
				}invite\` command.`
			)
			.addField(
				'Connected To',
				[
					`**Servers**: ${generalStatistics.guilds}`,
					`**Users**: ${generalStatistics.members}`,
					`**Channels**: ${generalStatistics.channels}`
				].join('\n'),
				true
			)
			.addField(
				'Server Stats',
				[
					`**CPU Load**: ${serverStatistics.cpuLoad.map((load) => `${load}%`).join(' | ')}`,
					`**RAM Used**: ${serverStatistics.ramUsed} (Total: ${serverStatistics.ramTotal})`,
					`**Uptime**: ${format(this.context.client.uptime ?? 0)}`
				].join('\n'),
				true
			);
	}

	private get generalStatistics() {
		return {
			guilds: this.context.client.guilds.cache.size.toLocaleString('en-US'),
			// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
			members: this.context.client.guilds.cache.reduce((a, b) => b.memberCount + a, 0).toLocaleString('en-US'),
			channels: this.context.client.channels.cache.size.toLocaleString('en-US')
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
