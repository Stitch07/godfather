import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, TextChannel } from 'discord.js';
import { CommandOptions } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
	description: 'Remove your vote from a player/nolynch.',
	preconditions: ['GuildOnly', 'GameOnly', 'GameStartedOnly', 'PlayerOnly', 'AlivePlayerOnly', 'GameStartedOnly']
})
export default class extends GodfatherCommand {

	public async run(msg: Message) {
		const { game } = msg.channel as TextChannel;
		const voter = game!.players.get(msg.author)!;
		const unvoted = game!.votes.unvote(voter);

		if (unvoted) {
			await msg.reactions.add('✅');
		}
		return msg.channel.send('No votes to remove!');
	}

}
