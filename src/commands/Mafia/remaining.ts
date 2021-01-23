import GodfatherCommand from '@lib/GodfatherCommand';
import Game, { Phase } from '@mafia/structures/Game';
import { ApplyOptions } from '@sapphire/decorators';
import { BucketType, CommandOptions } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'Shows when the current day/night ends.',
	preconditions: ['GameOnly', { name: 'Cooldown', context: { bucketType: BucketType.Channel, delay: Time.Second * 5 } }]
})
export default class RemainingCommand extends GodfatherCommand {
	public async run(message: Message) {
		const { game } = message.channel;
		return message.channel.send(this.getOutput(game!));
	}

	public getOutput(game: Game) {
		return `${this.getFullPhase(game)} ends in ${game.remaining()}`;
	}

	private getFullPhase(game: Game) {
		switch (game.phase) {
			case Phase.Day:
				return `Day ${game.cycle}`;
			case Phase.Night:
				return `Night ${game.cycle}`;
			case Phase.Trial:
				return `The current trial`;
			case Phase.TrialVoting:
				return `The current trial-vote`;
			case Phase.Pregame:
				throw "The game hasn't started yet!";
			default:
				throw 'The bot is currently processing the game.';
		}
	}
}
