import { BucketType, CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '@lib/GodfatherCommand';
import { Message } from 'discord.js';
import { Phase } from '@root/lib/mafia/Game';
import { Time } from '@sapphire/time-utilities';

@ApplyOptions<CommandOptions>({
	aliases: ['noeliminate', 'vtnl', 'nl'],
	description: 'Vote to not eliminate.',
	preconditions: ['GuildOnly', 'GameOnly', 'PlayerOnly', 'AlivePlayerOnly', 'GameStartedOnly', 'DayOnly', { entry: 'Cooldown', context: { bucketType: BucketType.Channel, delay: Number(Time.Second) } }]
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
