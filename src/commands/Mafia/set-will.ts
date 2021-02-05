import GodfatherCommand from '@lib/GodfatherCommand';
import { handleRequiredArg } from '@root/lib/util/utils';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	generateDashLessAliases: true,
	description: 'Sets a given message as your will.',
	detailedDescription: 'Use the --append/-a flag to append a message to the end of your current will.',
	preconditions: ['DMOnly'],
	strategyOptions: {
		flags: ['a', 'append']
	}
})
export default class extends GodfatherCommand {
	public async run(message: Message, args: Args) {
		const game = this.context.client.games.find((game) => Boolean(game.players.get(message.author)));
		if (!game) throw await message.resolveKey('preconditions:NoActiveGames');

		if (game.settings.disableWills) throw await message.resolveKey('commands/mafia:showWillDisabled');
		if (!game.hasStarted) throw await message.resolveKey('preconditions:GameStartedOnly');

		const player = game.players.get(message.author)!;
		if (!player.isAlive) throw await message.resolveKey('commands/mafia:setwillDead');

		let will = await args.rest('string', { maximum: 400 }).catch(handleRequiredArg('will'));
		if (args.getFlags('a', 'append')) {
			will = player.will === '' ? will : `${player.will}\n${will}`;
		}

		if (will.split('\n').length > 8) throw await message.resolveKey('commands/mafia:setwillMaximumLines', { max: 8 });
		player.will = will;

		return message.channel.sendTranslated('commands/mafia:setwillSuccess');
	}
}
