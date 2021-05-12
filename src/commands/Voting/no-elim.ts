import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { BucketType, CommandOptions } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['no-eliminate', 'vtnl', 'nl'],
	generateDashLessAliases: true,
	description: 'commands/help:noelimDescription',
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

		const t = await message.fetchT();
		await message.channel.send(t('commands/voting:noelimSuccess'));

		if (noElim) {
			game!.idlePhases++;
			await message.channel.send(t('commands/voting:noelimResult'));
			await game!.phaseChangeMutex.runExclusive(() => game!.startNight());
		}
	}
}
