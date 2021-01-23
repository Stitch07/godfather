import { Args, CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '@lib/GodfatherCommand';
import { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['showwill'],
	description: 'Shows your will.',
	preconditions: ['DMOnly']
})
export default class extends GodfatherCommand {

	public async run(message: Message, args: Args) {
		const game = this.context.client.games.find(game => Boolean(game.players.get(message.author)));
		if (!game) throw "You aren't in any active games!";

		if (game.settings.disableWills) throw 'Wills are disabled in this game.';
		if (!game.hasStarted) throw "The game hasn't started yet!";

		const player = await args.pick('player', { game }).then(p => {
			if (p.isAlive && p.user.id !== message.author.id) {
				throw "You can only check your own or a dead player's will.";
			}
			return p;
		}, () => game.players.get(message.author)!);

		const { start, end, subject } = player.user === message.author
			? { start: 'You have', end: ' yet', subject: 'Your' }
			: { start: `${player.user.username} has`, end: '', subject: `${player.user.username}'s` };

		if (!player.will.trim()) {
			return message.channel.send(`${start} not set a will${end}.`);
		}

		return message.channel.send(`${subject} will is:\n\`\`\`${player.will}\`\`\``);
	}

}
