import GodfatherCommand from '@lib/GodfatherCommand';
import { DEFAULT_GAME_SETTINGS } from '@root/lib/constants';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'Closes a game lobby, preventing more players from joining it.',
	preconditions: ['GuildOnly', 'GameOnly', 'HostOnly']
})
export default class extends GodfatherCommand {
	public async run(message: Message) {
		const { game } = message.channel;

		if (game!.players.length === DEFAULT_GAME_SETTINGS.maxPlayers) throw await message.resolveKey('commands/lobby:closeAlreadyMaxed');
		if (game!.players.length < 3) throw await message.resolveKey('commands/lobby:closeMinimum3');

		// setting the current number to max is equivalent to "closing" a lobby ;)
		game!.settings.maxPlayers = game!.players.length;

		return message.channel.sendTranslated('commands/lobby:closeSuccess', [{ max: game!.settings.maxPlayers }]);
	}
}
