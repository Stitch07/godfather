import { Args, CommandOptions, err, ok, UserError } from '@sapphire/framework';
import Player from '#mafia/structures/Player';
import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '#lib/GodfatherCommand';
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

		// this doesn't work for `willshow 2`.
		// const player = await args.pick('player').then(p => {
		// 	console.log(p.user.username);
		// 	if (p.isAlive && p.user.id !== message.author.id) {
		// 		throw "You can only check your own or a dead player's will.";
		// 	} else {
		// 		return p;
		// 	}
		// }, () => game.players.get(message.author)!);

		// this doesn't work for `willshow`.
		const playerResolver = Args.make(arg => {
			if (!arg) return ok(game.players.get(message.author)!);
			const player = Player.resolve(game, arg);
			if (!player) return err(new UserError('ArgumentPlayerInvalid', 'Invalid player provided. Use a valid number.'));
			if (player.isAlive && player.user.id !== message.author.id) {
				return err(new UserError('ArgumentPlayerAlive', "You can only check your own or a dead player's will!"));
			}
			return ok(player);
		});

		const player = await args.pick(playerResolver);

		if (!player.will.trim()) {
			return message.channel.send('You have not set a will yet.');
		}

		await message.channel.send(`Your will is:\n\`\`\`${player.will}\`\`\``);
	}

}
