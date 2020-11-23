import { CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '@lib/GodfatherCommand';
import { Message } from 'discord.js';
import { Phase } from '@root/lib/mafia/Game';

@ApplyOptions<CommandOptions>({
	aliases: ['vtnl', 'nl'],
	preconditions: ['GuildOnly', 'GameOnly', 'PlayerOnly', 'AlivePlayerOnly', 'GameStartedOnly', 'DayOnly']
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
