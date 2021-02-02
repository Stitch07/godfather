import GodfatherCommand from '@lib/GodfatherCommand';
import { Phase } from '@mafia/structures/Game';
import { ApplyOptions } from '@sapphire/decorators';
import { BucketType, CommandOptions } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['no-eliminate', 'vtnl', 'nl'],
	generateDashLessAliases: true,
	description: 'Vote to not eliminate.',
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
	public async run(message: Message) {
		const { game } = message.channel;
		const voter = game!.players.get(message.author)!;
		const noElim = game!.votes.noEliminate(voter);

		await message.channel.send('You have voted not to eliminate.');

		if (noElim) {
			game!.phase = Phase.Standby;
			game!.idlePhases++;
			await message.channel.send('Nobody was eliminated!');
			await game!.startNight();
		}
	}
}
