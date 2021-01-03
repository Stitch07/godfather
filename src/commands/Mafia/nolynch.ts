import { BucketType, CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '@lib/GodfatherCommand';
import { Message } from 'discord.js';
import { Phase } from '@mafia/structures/Game';
import { Time } from '@sapphire/time-utilities';

@ApplyOptions<CommandOptions>({
	aliases: ['vtnl', 'nl'],
	description: 'Vote to not lynch.',
	preconditions: ['GuildOnly', 'GameOnly', 'PlayerOnly', 'AlivePlayerOnly', 'GameStartedOnly', 'DayOnly', { name: 'Cooldown', context: { bucketType: BucketType.Channel, delay: Number(Time.Second) } }]
})
export default class extends GodfatherCommand {

	public async run(message: Message) {
		const { game } = message.channel;
		const voter = game!.players.get(message.author)!;
		const noLynch = game!.votes.noLynch(voter);

		await message.channel.send('You have voted to no-lynch.');

		if (noLynch) {
			game!.phase = Phase.Standby;
			game!.idlePhases++;
			await message.channel.send('Nobody was lynched!');
			await game!.startNight();
		}
	}

}
