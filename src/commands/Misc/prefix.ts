import GuildSettingRepository from '@root/lib/orm/repositories/GuildSettingRepository';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Message } from 'discord.js';
import { getCustomRepository } from 'typeorm';

@ApplyOptions<CommandOptions>({
	preconditions: ['GuildOnly', 'AdminOnly']
})
export default class extends Command {

	public async run(message: Message, args: Args) {
		const newPrefix = await args.restResult('string');
		const guildSettings = await getCustomRepository(GuildSettingRepository).ensure(this.client, message.guild!);

		if (!newPrefix.success) {
			return message.channel.send(`My prefix in this server is set to: ${guildSettings.prefix}`);
		}
		if (newPrefix.value.length > 10) throw 'Prefixes can be 10 characters at most.';
		guildSettings.prefix = newPrefix.value;
		await getCustomRepository(GuildSettingRepository).updateSettings(this.client, guildSettings);
		return message.channel.send(`Successfully updated this server's prefix to: \`${newPrefix.value}\``);
	}

}
