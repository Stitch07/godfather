import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '@lib/GodfatherCommand';
import Player from '@mafia/Player';
import { Message } from 'discord.js';
import { CommandOptions } from '@sapphire/framework';
import { Phase } from '@root/lib/mafia/Game';

@ApplyOptions<CommandOptions>({
	aliases: ['in'],
	description: 'Adds you to the playerlist of an ongoing game.',
	preconditions: ['GuildOnly', 'GameOnly']
})
export default class extends GodfatherCommand {

	public run(message: Message) {
		const { game } = message.channel;
		if (game!.players.find(player => player.user.id === message.author.id)) {
			throw 'You have already joined.';
		}
		// prevent players from joining 2 games simultaneously
		for (const otherGame of this.client.games.values()) {
			if (otherGame.players.get(message.author)) throw `You are already playing another game in ${otherGame.channel} (${otherGame.channel.guild.name})`;
		}
		// do not allow replacing in while the bot is processing the game
		if (game!.phase === Phase.Standby) throw 'You cannot replace in between phases.';
		if (game!.hasStarted && game!.phase) {
			game!.players.replacements.push(message.author);
			return message.channel.send('You have decided to become a replacement.');
		}
		game!.players.push(new Player(message.author, game!));
		game!.createdAt = new Date();
		return message.channel.send('✅ Successfully joined.');
	}

}
