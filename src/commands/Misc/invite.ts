import GodfatherCommand from '@lib/GodfatherCommand';
import { SUPPORT_SERVER } from '@root/config';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '@sapphire/framework';
import { Branding } from '@util/utils';
import { Message, MessageEmbed } from 'discord.js';

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
      .setDescription([`[Invite](${this.context.client.invite}) | [Support Server](${SUPPORT_SERVER})`].filter((line) => line !== null).join('\n'));
  }
}
