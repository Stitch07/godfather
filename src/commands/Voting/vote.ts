import GodfatherCommand from '@lib/GodfatherCommand';
import { Phase } from '@mafia/structures/Game';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, BucketType, CommandOptions } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { handleRequiredArg } from '@util/utils';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['vtl', 'vt'],
	description: 'commands/help:voteDescription',
	detailedDescription: 'commands/help:voteDetailed',
	preconditions: [
		'GuildOnly',
		'GameOnly',
		'PlayerOnly',
		'AlivePlayerOnly',
		'GameStartedOnly',
		'DayOnly',
		{ name: 'Cooldown', context: { bucketType: BucketType.Channel, delay: Number(Time.Second) } }
	]
})
export default class extends GodfatherCommand {
	public async run(message: Message, args: Args) {
		const target = await args.pick('player').catch(handleRequiredArg('player'));
		const { game } = message.channel;

		if (game?.nightActions.protectedPlayers.includes(target)) return game.channel.sendTranslated('commands/voting:voteProtected');

		const voter = game!.players.get(message.author)!;
		const hammered = game!.votes.vote(voter, target);

		await message.channel.sendTranslated('commands/voting:voteSuccess', [{ target: target.user.tag }]);

		if (hammered && target.isAlive) {
			game!.phase = Phase.Standby;
			await game!.hammer(target);
		}
	}
}
