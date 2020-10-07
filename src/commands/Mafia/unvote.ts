import { ApplyOptions } from '@util/utils';
import { Message, TextChannel } from 'discord.js';
import { Command, CommandOptions } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
	description: 'Remove your vote from a player/nolynch.',
	preconditions: ['GuildOnly', 'GameOnly', 'GameStartedOnly', 'PlayerOnly', 'AlivePlayerOnly']
})
export default class extends Command {

	public async run(msg: Message) {
		const { game } = msg.channel as TextChannel;
		const voter = game!.players.get(msg.author)!;
		const unvoted = game!.votes.unvote(voter);

		if (unvoted) {
			await msg.reactions.add('✅');
			return [];
		}
		return msg.channel.send('No votes to remove!');
	}

}
