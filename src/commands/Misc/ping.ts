import { ApplyOptions } from '@lib/util/utils';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'Self explanatory...'
})
export default class extends Command {

	public async run(message: Message) {
		return message.channel.send('Pong!');
	}

}
