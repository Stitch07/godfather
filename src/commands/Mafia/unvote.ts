import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, TextChannel } from 'discord.js';
import { CommandOptions } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
	description: 'Remove your vote from a player/nolynch.',
	preconditions: ['GuildOnly', 'GameOnly', 'GameStartedOnly', 'PlayerOnly', 'AlivePlayerOnly', 'GameStartedOnly', 'DayOnly']
})
export default class extends GodfatherCommand {

	public async run(message: Message) {
		const { game } = message.channel as TextChannel;
		const voter = game!.players.get(message.author)!;
		const unvoted = game!.votes.unvote(voter);

		if (unvoted) {
			return message.react('✅');
		}
		return message.channel.send('No votes to remove!');
	}

}
