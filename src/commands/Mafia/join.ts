import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '@lib/GodfatherCommand';
import Player from '@mafia/Player';
import { Message, TextChannel } from 'discord.js';
import { CommandOptions } from '@sapphire/framework';
import { Phase } from '@root/lib/mafia/Game';

@ApplyOptions<CommandOptions>({
	aliases: ['in'],
	description: 'Adds you to the playerlist of an ongoing game.',
	preconditions: ['GuildOnly', 'GameOnly']
})
export default class extends GodfatherCommand {

	public run(msg: Message) {
		const { game } = msg.channel as TextChannel;
		if (game!.players.find(player => player.user.id === msg.author.id)) {
			throw 'You have already joined.';
		}
		// prevent players from joining 2 games simultaneously
		for (const otherGame of this.client.games.values()) {
			if (otherGame.players.get(msg.author)) throw `You are already playing another game in ${otherGame.channel} (${otherGame.channel.guild.name})`;
		}
		if (game!.hasStarted || game!.phase === Phase.Standby) {
			// do replacements here sometime
			return;
		}
		game!.players.push(new Player(msg.author, game!));
		return msg.channel.send('✅ Successfully joined.');
	}

}
