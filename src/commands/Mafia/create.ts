import { KlasaMessage } from 'klasa';
import { ApplyOptions } from '@skyra/decorators';
import { ChannelType } from '@klasa/dapi-types';
import Game from '@mafia/Game';
import { TextChannel, Message } from '@klasa/core';
import GodfatherCommand, { GodfatherCommandOptions } from '@lib/GodfatherCommand';

@ApplyOptions<GodfatherCommandOptions>({
	aliases: ['creategame'],
	cooldown: 5,
	extendedHelp: [
		'To join an existing game, use the `join` command.',
		'Hosts may delete running games using the `delete` command.'
	].join('\n'),
	description: 'Creates a game of mafia in the current channel.',
	runIn: [ChannelType.GuildText]
})
export default class extends GodfatherCommand {

	public async run(msg: KlasaMessage): Promise<Message[]> {
		if (this.client.games.has(msg.channel.id)) {
			throw 'A game of Mafia is already running in this channel.';
		}
		const game = new Game(msg.author, msg.channel as TextChannel);
		this.client.games.set(msg.channel.id, game);
		return msg.reply(mb => mb.setContent(`Started a game of Mafia in ${msg.channel} hosted by **${msg.author.tag}**.`));
	}

}
