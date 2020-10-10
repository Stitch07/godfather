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
		const footer = this.client.release === Branding.Release.Beta
			? 'Godfather is currently semi-public. Use the `apply` command to apply for approval. Godfather will automatically leave servers that aren\'t approved'
			: null;

		return new MessageEmbed()
			.setColor(Branding.PrimaryColor)
			.setAuthor(this.client.user!.username, this.client.user!.displayAvatarURL({ format: 'png' }))
			.setDescription([
				`[Invite](${this.client.invite}) | [Support Server](${SUPPORT_SERVER})`,
				footer
			].filter(line => line !== null).join('\n'));
	}

}
