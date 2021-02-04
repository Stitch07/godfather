import { DEFAULT_GAME_SETTINGS } from '@lib/constants';
import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'Opens a game lobby, allowing people to join again.',
	preconditions: ['GuildOnly', 'GameOnly', 'HostOnly']
})
export default class extends GodfatherCommand {
	public async run(message: Message) {
		const { game } = message.channel;
		if (game!.players.length === DEFAULT_GAME_SETTINGS.maxPlayers) throw await message.resolveKey('commands/lobby:openMaxSize');
		game!.settings.maxPlayers = DEFAULT_GAME_SETTINGS.maxPlayers;

		return message.channel.sendTranslated('commands/lobby:openSuccess', [{ maxPlayers: game!.settings.maxPlayers }]);
	}
}
