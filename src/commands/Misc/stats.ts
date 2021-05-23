import GodfatherCommand from '@lib/GodfatherCommand';
import { getHandler } from '@root/languages';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptions, PermissionsPrecondition } from '@sapphire/framework';
import { roundNumber } from '@sapphire/utilities';
import { Message, MessageEmbed } from 'discord.js';
import { cpus } from 'os';

@ApplyOptions<CommandOptions>({
	description: 'commands/help:statsDescription',
	preconditions: [new PermissionsPrecondition('EMBED_LINKS')]
})
export default class extends GodfatherCommand {
	public async run(message: Message) {
		return message.channel.send(await this.buildEmbed(message));
	}

	private async buildEmbed(message: Message) {
		const prefix = await this.context.client.fetchPrefix(message);
		const { serverStatistics } = this;
		const t = await message.fetchT();
		const generalStatistics = this.generalStatistics(t.lng);

		const titles = t('commands/misc:statsTitles') as unknown as StatsTitles;
		const fields = t('commands/misc:statsFields') as unknown as StatsFields;

		return new MessageEmbed()
			.setColor('#000000')
			.setAuthor(this.context.client.user!.username, this.context.client.user!.displayAvatarURL({ format: 'png' }))
			.setDescription(
				t('commands/misc:statsDescription', {
					botname: this.context.client.user!.username,
					// eslint-disable-next-line object-shorthand
					prefix: Array.isArray(prefix) ? prefix[0] : prefix
				}) as unknown as string[]
			)
			.addField(
				titles.connectedTo,
				[
					`${fields.servers}: ${generalStatistics.guilds}`,
					`${fields.users}: ${generalStatistics.members}`,
					`${fields.channels}: ${generalStatistics.channels}`
				].join('\n'),
				true
			)
			.addField(
				titles.serverStats,
				[
					`${fields.cpuLoad}: ${serverStatistics.cpuLoad.map((load) => `${load}%`).join(' | ')}`,
					`${fields.ramUsed}: ${serverStatistics.ramUsed} (Total: ${serverStatistics.ramTotal})`,
					`${fields.uptime}: ${getHandler(t.lng).duration.format(this.context.client.uptime ?? 0, 2)}`
				].join('\n'),
				true
			);
	}

	private generalStatistics(locale: string) {
		return {
			guilds: this.context.client.guilds.cache.size.toLocaleString(locale),
			// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
			members: this.context.client.guilds.cache.reduce((a, b) => b.memberCount + a, 0).toLocaleString(locale),
			channels: this.context.client.channels.cache.size.toLocaleString(locale)
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

export interface StatsTitles {
	connectedTo: string;
	serverStats: string;
}

export interface StatsFields {
	servers: string;
	users: string;
	channels: string;
	cpuLoad: string;
	ramUsed: string;
	uptime: string;
}
