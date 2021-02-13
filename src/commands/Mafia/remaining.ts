import GodfatherCommand from '@lib/GodfatherCommand';
import Game, { Phase } from '@mafia/structures/Game';
import { ApplyOptions } from '@sapphire/decorators';
import { BucketType, CommandOptions } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import type { Message } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<CommandOptions>({
	description: 'commands/help:remainingDescription',
	preconditions: ['GameOnly', { name: 'Cooldown', context: { bucketType: BucketType.Channel, delay: Time.Second * 5 } }]
})
export default class RemainingCommand extends GodfatherCommand {
	public async run(message: Message) {
		const { game } = message.channel;
		return message.channel.send(this.getOutput(game!, await message.fetchT()));
	}

	public getOutput(game: Game, t: TFunction) {
		return t('commands/mafia:remainingOutput', { phase: this.getFullPhase(game, t), remaining: game.remaining() });
	}

	private getFullPhase(game: Game, t: TFunction) {
		switch (game.phase) {
			case Phase.Day:
				return t('commands/mafia:remainingDay', { cycle: game.cycle });
			case Phase.Night:
				return t('commands/mafia:remainingNight', { cycle: game.cycle });
			case Phase.Trial:
				return t('commands/mafia:remainingCurrentTrial');
			case Phase.TrialVoting:
				return t('commands/mafia:remainingCurrentTrialVote');
			case Phase.Pregame:
				throw t('commands/mafia:remainingPregame');
			default:
				throw t('commands/mafia:statusBotProcessing');
		}
	}
}
