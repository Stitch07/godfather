import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, CommandOptions } from '@sapphire/framework';
import { Message, TextChannel } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['vtl', 'vt'],
	description: 'Vote to lynch a player',
	preconditions: ['GuildOnly', 'GameOnly', 'PlayerOnly', 'AlivePlayerOnly']
})
export default class extends GodfatherCommand {

	public async run(msg: Message, args: Args) {
		const target = await args.pick('player');
		const { game } = msg.channel as TextChannel;

		const voter = game!.players.get(msg.author)!;
		const hammered = game!.votes.vote(voter, target);

		await msg.channel.send(`Voted ${target.user.tag}.`);

		if (hammered) {
			await game!.hammer(target);
		}
		return [];
	}

}
