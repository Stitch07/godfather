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
		const game = new Game(msg.author, msg.channel as TextChannel);
		this.client.games.set(msg.channel.id, game);
		return msg.channel.send(`Started a game of Mafia in <#${msg.channel.id}> hosted by **${msg.author.tag}**.`);
	}

}
