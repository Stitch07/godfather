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

		if (args.finished) {
			return message.channel.send(`My prefix in this server is set to: ${guildSettings.prefix}`);
		}
		const newPrefix = await args.pick('string', { maximum: 10 });

		if (newPrefix.length > 10) throw 'Prefixes can be 10 characters at most.';
		guildSettings.prefix = newPrefix;

		await guilds.save(guildSettings);
		this.context.client.prefixCache.set(message.guild!.id, newPrefix);
		return message.channel.send(`Successfully updated this server's prefix to: \`${newPrefix}\``);
	}

	public onLoad() {
		if (!PGSQL_ENABLED) this.enabled = false;
	}
}
