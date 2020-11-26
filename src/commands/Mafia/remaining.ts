import GodfatherCommand from '@lib/GodfatherCommand';
import Game, { Phase } from '@mafia/Game';
import { ApplyOptions } from '@sapphire/decorators';
import { BucketType, CommandOptions } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'Shows when the current day/night ends.',
	preconditions: ['GameOnly', { entry: 'Cooldown', context: { bucketType: BucketType.Channel, delay: Time.Second * 5 } }]
})
export default class extends GodfatherCommand {

	public async run(message: Message) {
		const { game } = message.channel;
		return message.channel.send(`${this.getFullPhase(game!)} ends in ${game!.remaining()}`);
	}

	private getFullPhase(game: Game) {
		switch (game.phase) {
			case Phase.Day:
				return `Day ${game.cycle}`;
			case Phase.Night:
				return `Night ${game.cycle}`;
			case Phase.Pregame:
				throw 'The game hasn\'t started yet!';
			default:
				throw 'The bot is currently processing the game.';
		}
	}

}
