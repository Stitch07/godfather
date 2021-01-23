import GodfatherCommand from '@lib/GodfatherCommand';
import type GuildSettingsEntity from '@root/lib/orm/entities/GuildSettings';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args, CommandContext, CommandOptions } from '@sapphire/framework';
import type { Message, TextChannel } from 'discord.js';

const mapChannelIDs = (channelID: string) => `<#${channelID}>`;

@ApplyOptions<CommandOptions>({
	preconditions: ['GuildOnly', ['AdminOnly', 'HostOnly']]
})
export default class extends GodfatherCommand {
	public async run(message: Message, args: Args, context: CommandContext) {
		const settings = await message.guild!.readSettings();
		const channels = await args.repeatResult('textChannel');

		if (!channels.success) {
			// remove any disabled channels that were deleted from the guild
			const filtered = settings.disabledChannels.filter((channelID) => message.guild!.channels.cache.has(channelID));
			if (filtered.length !== settings.disabledChannels.length) {
				settings.disabledChannels = filtered;
				await message.guild!.updateSettings(settings);
			}

			if (filtered.length === 0)
				return message.channel.send(`There are no disabled channels. Disable a channel using ${context.prefix}disablechannel #channel.`);

			return message.channel.send(`**Disabled Channels**: ${filtered.map(mapChannelIDs).join(', ')}`);
		}

		const { settings: newSettings, added, removed } = this.updateChannels(settings, channels.value);
		await message.guild!.updateSettings(newSettings);

		return message.channel.send(
			[
				added.length === 0 ? null : `Disabled Channel(s): ${added.map(mapChannelIDs).join(', ')}`,
				removed.length === 0 ? null : `Enabled Channel(s): ${removed.map(mapChannelIDs).join(', ')}`
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
