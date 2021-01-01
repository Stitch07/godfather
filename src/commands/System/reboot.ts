import { CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '#lib/GodfatherCommand';
import { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	preconditions: ['OwnerOnly']
})
export default class extends GodfatherCommand {

	public async run(message: Message) {
		// when used with pm2/Docker/another process manager, it will restart the bot as soon as
		// it shuts down
		await message.channel.send('Rebooting...');
		return process.exit(0);
	}

}
