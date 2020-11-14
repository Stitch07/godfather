import GodfatherCommand from '@lib/GodfatherCommand';
import { Phase } from '@mafia/Game';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['vtl', 'vt'],
	description: 'Vote to lynch a player',
	preconditions: ['GuildOnly', 'GameOnly', 'PlayerOnly', 'AlivePlayerOnly', 'GameStartedOnly', 'DayOnly', { entry: 'Cooldown', context: { delay: 3000 } }]
})
export default class extends GodfatherCommand {

	public async run(message: Message, args: Args) {
		const target = await args.pick('player')
			.catch(() => { throw 'An invalid player was provided.'; });
		const { game } = message.channel;

		const voter = game!.players.get(message.author)!;
		const hammered = game!.votes.vote(voter, target);

		await message.channel.send(`Voted ${target.user.tag}.`);

		if (hammered) {
			game!.phase = Phase.Standby;
			await game!.hammer(target);
		}
	}

}
