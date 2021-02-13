import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'commands/help:changehostDescription',
	detailedDescription: 'commands/help:changehostDetailed',
	preconditions: ['GuildOnly', 'GameOnly', 'PlayerOnly', 'AlivePlayerOnly']
})
export default class extends GodfatherCommand {
	public async run(message: Message) {
		const { game } = message.channel;
		const t = await message.fetchT();

		if (game!.hasStarted) throw t('commands/lobby:changehostStarted');
		if (game!.players.length < 3) throw t('commands/lobby:changehostMinimum3');

		let toChange = false;
		if (message.author.id === game!.host.user.id) {
			toChange = true;
		} else {
			if (game!.players.voteKicks.has(message.author.id)) throw t('commands/lobby:changehostAlreadyVoted');
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

			await message.channel.send(t('commands/lobby:changehostHostChanged', { host: game!.host.toString() }));
		}
	}
}
