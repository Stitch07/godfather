import { Args, BucketType, CommandContext, CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '@lib/GodfatherCommand';
import { Message, MessageEmbed } from 'discord.js';
import Game, { Phase } from '@mafia/Game';
import { codeBlock } from '@sapphire/utilities';

@ApplyOptions<CommandOptions>({
	description: 'Shows you useful information about the game.',
	preconditions: ['GameOnly', { entry: 'Cooldown', context: { bucketType: BucketType.Channel, delay: 5000 } }]
})
export default class extends GodfatherCommand {

	public run(message: Message, args: Args, context: CommandContext) {
		const { game } = message.channel;

		if (!game!.hasStarted) {
			// eslint-disable-next-line @typescript-eslint/no-base-to-string
			return message.channel.send(`The game in ${message.channel} hasn't started yet! Use the \`${context.prefix}start\` to start it.`);
		} else if (game!.phase === Phase.Standby) {
			return message.channel.send('The bot is processing the game right now. Hang tight!');
		}

		const embed = new MessageEmbed();
		embed.addField('Host', game!.host.user.tag, true)
			.addField('Phase', this.getFullPhase(game!), true)
			.addField('Time Remaining', game!.remaining(), true)
			.addField('Players', codeBlock('diff', game!.players.show({ codeblock: true })));
		return message.channel.send(embed);
	}

	private getFullPhase(game: Game) {
		if (game.phase === Phase.Day) return `Day ${game.cycle} 🌅`;
		else if (game.phase === Phase.Night) return `Night ${game.cycle} 🌃`;
	}

}
