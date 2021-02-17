import GodfatherCommand from '@lib/GodfatherCommand';
import { SUPPORT_SERVER } from '@root/config';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<CommandOptions>({
	description: 'commands/help:inviteDescription'
})
export default class extends GodfatherCommand {
	public async run(message: Message) {
		return message.channel.send(this.buildEmbed(await message.fetchT()));
	}

	private buildEmbed(t: TFunction) {
		const { client } = this.context;
		const description = t('commands/misc:inviteText', { bot: client.user!.username, invite: client.invite, supportServer: SUPPORT_SERVER });
		return new MessageEmbed()
			.setColor('#000000')
			.setAuthor(this.context.client.user!.username, this.context.client.user!.displayAvatarURL({ format: 'png' }))
			.setDescription(description);
	}
}
