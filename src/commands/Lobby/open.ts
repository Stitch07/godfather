import { CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '@lib/GodfatherCommand';
import { DEFAULT_GAME_SETTINGS } from '@lib/constants';
import { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	preconditions: ['GuildOnly', 'GameOnly', 'HostOnly']
})
export default class extends GodfatherCommand {

	public async run(message: Message) {
		const { game } = message.channel;
		if (game!.players.length === DEFAULT_GAME_SETTINGS.maxPlayers) throw 'This lobby is already at maximum size.';
		game!.settings.maxPlayers = DEFAULT_GAME_SETTINGS.maxPlayers;

		return message.channel.send(`✅ Set maximum players to ${game!.settings.maxPlayers}`);
	}

}
