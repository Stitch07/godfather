import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '@lib/GodfatherCommand';
import Game from '@mafia/Game';
import { cast } from '@util/utils';
import { Message, TextChannel } from 'discord.js';
import { Args, CommandContext, CommandOptions } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
	aliases: ['creategame'],
	description: 'Creates a game of mafia in the current channel.',
	detailedDescription: [
		'To join an existing game, use the `join` command.',
		'Hosts may delete running games using the `delete` command.'
	].join('\n'),
	preconditions: ['GuildOnly']
})
export default class extends GodfatherCommand {

	public async run(message: Message, args: Args, context: CommandContext) {
		if (this.client.games.has(message.channel.id)) {
			throw 'A game of Mafia is already running in this channel.';
		}
		// prevent players from joining 2 games simultaneously
		for (const otherGame of this.client.games.values()) {
			if (otherGame.players.get(message.author)) throw `You are already playing another game in ${otherGame.channel} (${otherGame.channel.guild.name})`;
		}

		const game = new Game(message.author, cast<TextChannel>(message.channel));
		game.createdAt = new Date();
		this.client.games.set(message.channel.id, game);
		return message.channel.send(`Started a game of Mafia in <#${message.channel.id}> hosted by **${message.author.tag}**. Use ${context.prefix}join to join it.`);
	}

}
