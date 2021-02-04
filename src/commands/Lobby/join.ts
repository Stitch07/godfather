import GodfatherCommand from '@lib/GodfatherCommand';
import { Phase } from '@mafia/structures/Game';
import Player from '@mafia/structures/Player';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['in', 'j'],
	description: 'Adds you to the playerlist of an ongoing game.',
	preconditions: ['GuildOnly', 'GameOnly']
})
export default class extends GodfatherCommand {
	public async run(message: Message) {
		const { game } = message.channel;
		if (game!.players.find((player) => player.user.id === message.author.id)) {
			throw await message.resolveKey('commands/lobby:joinAlreadyJoined');
		}
		// prevent players from joining 2 games simultaneously
		for (const otherGame of this.context.client.games.values()) {
			if (otherGame.players.get(message.author))
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				throw await message.resolveKey('commands/lobby:otherChannel', [{ channel: message.channel.toString(), guild: message.guild!.name }]);
		}
		// do not allow replacing in while the bot is processing the game
		if (game!.phase === Phase.Standby) throw await message.resolveKey('commands/lobby:joinBetweenPhases');
		if (game!.hasStarted && game!.phase) {
			if (game!.players.replacements.includes(message.author)) throw await message.resolveKey('commands/lobby:joinAlreadyReplacement');
			game!.players.replacements.push(message.author);
			return message.channel.sendTranslated('joinSuccessfulReplacement');
		}

		if (game!.players.length >= game!.settings.maxPlayers)
			throw await message.resolveKey('commands/lobby:joinMaxPlayers', [{ maxPlayers: game!.settings.maxPlayers }]);

		game!.players.push(new Player(message.author, game!));
		game!.createdAt = new Date();
		return message.channel.sendTranslated('commands/lobby:joinSuccess', [{ playerCount: game!.players.length }]);
	}
}
