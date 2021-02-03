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

		if (game!.players.length === DEFAULT_GAME_SETTINGS.maxPlayers) throw message.resolveKey('commands/mafia:closeAlreadyMaxed');
		if (game!.players.length < 3) throw message.resolveKey('commands/mafia:closeMinimum3');

		// setting the current number to max is equivalent to "closing" a lobby ;)
		game!.settings.maxPlayers = game!.players.length;

		return message.channel.sendTranslated('commands/mafia:closeSuccess', [{ max: game!.settings.maxPlayers }]);
	}
}
