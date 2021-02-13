import { DbSet } from '@lib/database/DbSet';
import GodfatherCommand from '@lib/GodfatherCommand';
import GuildSettingsEntity from '@lib/orm/entities/GuildSettings';
import { PGSQL_ENABLED } from '@root/config';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'View and change the server prefix.',
	preconditions: ['GuildOnly', ['AdminOnly', 'OwnerOnly']]
})
export default class extends GodfatherCommand {
	public async run(message: Message, args: Args) {
		const { guilds } = await DbSet.connect();
		const guildSettings =
			(await guilds.findOne(message.guild!.id, {
				select: ['id', 'prefix']
			})) ?? new GuildSettingsEntity();
		guildSettings.id = message.guild!.id;

		if (args.finished) {
			return message.channel.sendTranslated('commands/misc:prefixCurrent', [{ prefix: guildSettings.prefix }]);
		}
		const newPrefix = await args.pick('string', { maximum: 10 });
		guildSettings.prefix = newPrefix;

		await guilds.save(guildSettings);
		this.context.client.prefixCache.set(message.guild!.id, newPrefix);
		return message.channel.sendTranslated('commands/misc:prefixUpdated', [{ prefix: newPrefix }]);
	}

	public onLoad() {
		if (!PGSQL_ENABLED) this.enabled = false;
	}
}
