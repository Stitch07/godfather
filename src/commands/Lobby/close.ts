import { CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '@lib/GodfatherCommand';
import { Message } from 'discord.js';
import { DEFAULT_GAME_SETTINGS } from '@root/lib/constants';

@ApplyOptions<CommandOptions>({
	preconditions: ['GuildOnly', 'GameOnly', 'HostOnly']
})
export default class extends GodfatherCommand {

	public async run(message: Message) {
		const { game } = message.channel;
		if (game!.players.length === DEFAULT_GAME_SETTINGS.maxPlayers) throw 'This lobby is already at maximum size.';
		if (game!.players.length < 3) throw 'You need at least 3 players to close a lobby.';

		// setting the current number to max is equivalent to "closing" a lobby ;)
		game!.settings.maxPlayers = game!.players.length;

		return message.channel.send(`✅ Set maximum players to ${game!.settings.maxPlayers}`);
	}

}
