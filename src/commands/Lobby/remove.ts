import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args, CommandOptions } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { handleRequiredArg } from '@util/utils';
import type { Message, MessageReaction, User } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'commands/help:removeDescription',
	detailedDescription: 'commands/help:removeDetailed',
	aliases: ['kick'],
	preconditions: ['GuildOnly', 'GameOnly', 'HostOnly']
})
export default class extends GodfatherCommand {
	public async run(message: Message, args: Args) {
		const player = await args.pick('player').catch(handleRequiredArg('player'));
		const { game } = message.channel;
		if (game?.host.user.id === player.user.id) return message.channel.sendTranslated('commands/lobby:removeSelf');
		if (!game!.hasStarted) {
			// directly remove the player if the game hasn't started
			void game!.players.remove(player);
			return message.channel.sendTranslated('commands/lobby:removeDirect', [{ player }]);
		}
		// if the game has started, we give the player 45 seconds to prove they aren't AFK
		const confirmationMessage = await message.channel.sendTranslated('commands/lobby:removeReminder', [{ player: player.user }]);
		await confirmationMessage.react('✅');
		const reactions = await confirmationMessage.awaitReactions(
			(reaction: MessageReaction, user: User) => reaction.emoji.name === '✅' && user.id === player.user.id,
			{
				max: 1,
				time: Time.Second * 45
			}
		);

		if (reactions.size > 0) {
			await message.react('❌');
			return confirmationMessage.delete();
		}

		await game!.players.remove(player, false);
		const winCheck = game!.checkEndgame();
		if (winCheck.ended) {
			return game!.end(winCheck);
		}
	}
}
