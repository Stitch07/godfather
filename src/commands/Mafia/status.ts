import GodfatherCommand from '@lib/GodfatherCommand';
import Game, { Phase } from '@mafia/structures/Game';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, BucketType, CommandContext, CommandOptions } from '@sapphire/framework';
import { codeBlock } from '@sapphire/utilities';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'commands/help:statusDescription',
	detailedDescription: 'commands/help:statusDetailed',
	preconditions: ['GameOnly', { name: 'Cooldown', context: { bucketType: BucketType.Channel, delay: 5000 } }]
})
export default class extends GodfatherCommand {
	public async run(message: Message, _: Args, context: CommandContext) {
		const { game } = message.channel;

		if (!game!.hasStarted) {
			// eslint-disable-next-line @typescript-eslint/no-base-to-string
			return message.channel.sendTranslated('commands/mafia:statusNotStarted', [{ channel: message.channel, prefix: context.prefix }]);
		} else if (game!.phase === Phase.Standby) {
			return message.channel.sendTranslated('commands/mafia:statusBotProcessing');
		}

		const titles = ((await message.resolveKey('commands/mafia:statusTitles')) as unknown) as StatusEmbedTitles;
		const embed = new MessageEmbed();
		embed
			.addField(titles.host, game!.host.user.tag, true)
			.addField(titles.phase, this.getFullPhase(game!), true)
			.addField(titles.timeRemaining, game!.remaining(), true)
			.addField(titles.players, codeBlock('diff', game!.players.show({ codeblock: true })));
		return message.channel.send(embed);
	}

	private getFullPhase(game: Game) {
		if (game.phase === Phase.Day) return `Day ${game.cycle} 🌅`;
		else if (game.phase === Phase.Night) return `Night ${game.cycle} 🌃`;
		return undefined;
	}
}

export interface StatusEmbedTitles {
	host: string;
	phase: string;
	timeRemaining: string;
	players: string;
}
