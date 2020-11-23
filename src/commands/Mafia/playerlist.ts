import GodfatherCommand from '@lib/GodfatherCommand';
import { CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, TextChannel } from 'discord.js';
import { BucketType } from '@root/preconditions/Cooldown';
import { Time } from '@sapphire/time-utilities';

@ApplyOptions<CommandOptions>({
	aliases: ['players', 'pl'],
	description: 'Shows the playerlist of an ongoing game.',
	preconditions: ['GuildOnly', 'GameOnly', { entry: 'Cooldown', context: { type: BucketType.Channel, delay: Time.Second * 5 } }]
})
export default class extends GodfatherCommand {

	public run(msg: Message) {
		const { game } = msg.channel as TextChannel;
		return msg.channel.send(game!.players.show());
	}

}
