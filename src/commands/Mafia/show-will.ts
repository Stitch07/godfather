import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['will', 'will-show'],
	generateDashLessAliases: true,
	description: 'Shows your will.',
	preconditions: ['DMOnly']
})
export default class extends GodfatherCommand {
	public async run(message: Message, args: Args) {
		const game = this.context.client.games.find((game) => Boolean(game.players.get(message.author)));
		if (!game) throw await message.resolveKey('preconditions:NoActiveGames');

		if (game.settings.disableWills) throw await message.resolveKey('commands/mafia:showWillDisabled');
		if (!game.hasStarted) throw await message.resolveKey('preconditions:GameStartedOnly');

		const player = await args
			.pick('player', { game })
			.then(async (p) => {
				if (p.isAlive && p.user.id !== message.author.id) {
					throw await message.resolveKey('commands/mafia:showWillInvalidTarget');
				}
				return p;
			})
			.catch(() => game.players.get(message.author)!);

		const { start, end, subject } =
			player.user === message.author
				? { start: 'You have', end: ' yet. Set one using `set-will`', subject: 'Your' }
				: { start: `${player.user.username} has`, end: '', subject: `${player.user.username}'s` };

		if (!player.will.trim()) return message.channel.send(`${start} not set a will${end}.`);

		return message.channel.send(`${subject} will is:\n\`\`\`${player.will}\`\`\``);
	}
}
