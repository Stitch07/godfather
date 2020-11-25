import { Args, CommandOptions, err, ok, UserError } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '@lib/GodfatherCommand';
import { Message } from 'discord.js';
import Player from '@mafia/Player';
import { Time } from '@sapphire/time-utilities';
import { Phase } from '@mafia/Game';

@ApplyOptions<CommandOptions>({
	aliases: ['w'],
	preconditions: ['DMOnly', { entry: 'Cooldown', context: { delay: Time.Second * 10 } }]
})
export default class extends GodfatherCommand {

	public async run(message: Message, args: Args) {
		const game = this.client.games.find(game => Boolean(game.players.get(message.author)));
		if (!game) throw "You aren't in any active games!";

		if (game.settings.disableWhispers) throw 'Whispering is disabled in this game.';
		if (!game.hasStarted) throw "The game hasn't started yet!";
		if (game.phase !== Phase.Day) throw 'You can only whisper during the day.';

		const player = game.players.get(message.author);
		// @ts-ignore Mayor
		if (player.role.name === 'Mayor' && player.role.hasRevealed) throw 'As a revealed Mayor, you cannot whisper.';

		const playerResolver = Args.make(arg => {
			const player = Player.resolve(game, arg);
			if (!player) return err(new UserError('ArgumentPlayerInvalid', 'Invalid player provided. Use a valid number.'));
			if (player.user.id === message.author.id) return err(new UserError('ArgumentPlayerDistinc', "You can't whisper to yourself!"));
			return ok(player);
		});

		const target = await args.pick(playerResolver);
		// @ts-ignore Mayor
		if (target.role.name === 'Mayor' && target.role.hasRevealed) throw 'You cannot whisper to a revealed Mayor.';
		const whisperContent = await args.rest('string')
			.catch(() => { throw 'What are you trying to whisper?'; });

		try {
			await target.user.send(`Whisper from **${message.author.tag}**: "${whisperContent}"`);
			await message.react('✅');
		} catch {
			return message.channel.send(`Whisper failed: ${target} doesn't have DMs open.`);
		} finally {
			await game.channel.send(`**${message.author.tag}** is whispering to **${target.user.tag}**.`);
		}
	}

}
