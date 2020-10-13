import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '@lib/GodfatherCommand';
import Game from '@mafia/Game';
import { Message, TextChannel } from 'discord.js';
import { CommandOptions } from '@sapphire/framework';

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

	public async run(msg: Message) {
		if (this.client.games.has(msg.channel.id)) {
			throw 'A game of Mafia is already running in this channel.';
		}
		// prevent players from joining 2 games simultaneously
		for (const otherGame of this.client.games.values()) {
			if (otherGame.players.get(msg.author)) throw `You are already playing another game in ${otherGame.channel} (${otherGame.channel.guild.name})`;
		}

		const game = new Game(msg.author, msg.channel as TextChannel);
		game.createdAt = new Date();
		this.client.games.set(msg.channel.id, game);
		return msg.channel.send(`Started a game of Mafia in <#${msg.channel.id}> hosted by **${msg.author.tag}**.`);
	}

}
