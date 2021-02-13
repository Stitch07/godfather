import GodfatherCommand from '@lib/GodfatherCommand';
import { DbSet } from '@lib/database/DbSet';
import GuildSettingsEntity from '@lib/orm/entities/GuildSettings';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args, CommandContext, CommandOptions } from '@sapphire/framework';
import type { Message, TextChannel } from 'discord.js';

const mapChannelIDs = (channelID: string) => `<#${channelID}>`;

@ApplyOptions<CommandOptions>({
	generateDashLessAliases: true,
	description: 'commands/help:disable-channelDescription',
	detailedDescription: 'commands/help:disable-channelDetailed',
	preconditions: ['GuildOnly', ['AdminOnly', 'HostOnly']]
})
export default class extends GodfatherCommand {
	public async run(message: Message, args: Args, context: CommandContext) {
		const { guilds } = await DbSet.connect();
		const settings =
			(await guilds.findOne(message.guild!.id, {
				select: ['id', 'disabledChannels']
			})) ?? new GuildSettingsEntity();
		const channels = await args.repeatResult('textChannel');

		if (!channels.success) {
			// remove any disabled channels that were deleted from the guild
			const filtered = settings.disabledChannels.filter((channelID) => message.guild!.channels.cache.has(channelID));
			if (filtered.length !== settings.disabledChannels.length) {
				settings.disabledChannels = filtered;
				await guilds.save(settings);
			}

			if (filtered.length === 0) return message.channel.sendTranslated('commands/admin:disableChannelNone', [{ prefix: context.prefix }]);

			return message.channel.sendTranslated('commands/admin:disableChannelView', [{ channels: filtered.map(mapChannelIDs) }]);
		}

		const { settings: newSettings, added, removed } = this.updateChannels(settings, channels.value);
		newSettings.id = message.guild!.id;
		await guilds.save(newSettings);

		const t = await message.fetchT();
		return message.channel.send(
			[
				added.length === 0 ? null : t('commands/admin:disableChannelAdded', { channels: added.map(mapChannelIDs) }),
				removed.length === 0 ? null : t('commands/admin:disableChannelRemoved', { channels: removed.map(mapChannelIDs) })
			]
				.filter((line) => line !== null)
				.join('\n')
		);
	}

	private updateChannels(settings: GuildSettingsEntity, channels: TextChannel[]) {
		const added: string[] = [];
		const removed: string[] = [];

		for (const channel of channels) {
			if (settings.disabledChannels.includes(channel.id)) {
				settings.disabledChannels.splice(settings.disabledChannels.indexOf(channel.id), 1);
				removed.push(channel.id);
			} else {
				settings.disabledChannels.push(channel.id);
				added.push(channel.id);
			}
		}

		return { settings, added, removed };
	}
}
