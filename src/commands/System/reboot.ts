import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	preconditions: ['OwnerOnly']
})
export default class extends GodfatherCommand {
	public async run(message: Message) {
		// when used with pm2/Docker/another process manager, it will restart the bot as soon as
		// it shuts down
		for (const game of this.context.client.games.values()) {
			await game.delete();
			await game.channel.send('The game has been deleted due to a bot shutdown, sorry!');
		}
		await message.channel.send('Rebooting...');
		return process.exit(0);
	}
}
