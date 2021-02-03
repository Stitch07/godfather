import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'Vote to change the host',
	detailedDescription: ['The host can use this command to instantly make the next player the host.'].join('\n'),
	preconditions: ['GuildOnly', 'GameOnly', 'PlayerOnly', 'AlivePlayerOnly']
})
export default class extends GodfatherCommand {
	public async run(message: Message) {
		const { game } = message.channel;
		const t = await message.fetchT();

		if (game!.hasStarted) throw t('commands/mafia:changehostStarted');
		if (game!.players.length < 3) throw t('commands/mafia:changehostMinimum3');

		let toChange = false;
		if (message.author.id === game!.host.user.id) {
			toChange = true;
		} else {
			if (game!.players.voteKicks.has(message.author.id)) throw t('commands/mafia:changehostAlreadyVoted');
			game!.players.voteKicks.add(message.author.id);
			await message.react('✅');

			const { majorityVotes } = game!;
			if (game!.players.voteKicks.size >= majorityVotes) toChange = true;
		}

		if (toChange) {
			// Since host is always player #1, we remove the old host from the beginning
			// (so #2 becomes host) and add the old host back at the end.
			const oldHost = game!.players.shift()!;
			game!.players.push(oldHost);
			game!.players.voteKicks.clear();

			await message.channel.send(t('commands/mafia:changehostHostChanged', { host: game!.host.toString() }));
		}
	}
}
