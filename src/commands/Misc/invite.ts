import { Branding } from '@util/utils';
import GodfatherCommand from '@lib/GodfatherCommand';
import { CommandOptions } from '@sapphire/framework';
import { SUPPORT_SERVER } from '@root/config';
import { Message, MessageEmbed } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<CommandOptions>({
	description: 'Get an invite link to the bot and support server.'
})
export default class extends GodfatherCommand {

	public async run(message: Message) {
		return message.channel.send(this.buildEmbed());
	}

	private buildEmbed() {
		return new MessageEmbed()
			.setColor(Branding.PrimaryColor)
			.setAuthor(this.context.client.user!.username, this.context.client.user!.displayAvatarURL({ format: 'png' }))
			.setDescription([
				`[Invite](${this.context.client.invite}) | [Support Server](${SUPPORT_SERVER})`
			].filter(line => line !== null).join('\n'));
	}

}
