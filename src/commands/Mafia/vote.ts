import GodfatherCommand from '@lib/GodfatherCommand';
import { Phase } from '@mafia/structures/Game';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, BucketType, CommandOptions } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['vtl', 'vt'],
	description: 'Vote to lynch a player',
	preconditions: ['GuildOnly', 'GameOnly', 'PlayerOnly', 'AlivePlayerOnly', 'GameStartedOnly', 'DayOnly', { entry: 'Cooldown', context: { bucketType: BucketType.Channel, delay: Number(Time.Second) } }]
})
export default class extends GodfatherCommand {

	public async run(message: Message, args: Args) {
		const target = await args.pick('player')
			.catch(() => { throw 'An invalid player was provided.'; });
		const { game } = message.channel;

		if (game?.nightActions.protectedPlayers.includes(target)) return game.channel.send('You cannot vote targets protected by a Guardian Angel');

		const voter = game!.players.get(message.author)!;
		const hammered = game!.votes.vote(voter, target);

		await message.channel.send(`Voted ${target.user.tag}.`);

		if (hammered && target.isAlive) {
			game!.phase = Phase.Standby;
			await game!.hammer(target);
		}
	}

}
