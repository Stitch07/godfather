import GodfatherCommand from '@lib/GodfatherCommand';
import { Phase } from '@mafia/structures/Game';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args, CommandOptions } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { handleRequiredArg } from '@util/utils';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['w'],
	description: 'commands/help:whisperDescription',
	detailedDescription: 'commands/help:whisperDetailed',
	preconditions: ['DMOnly', { name: 'Cooldown', context: { delay: Time.Second * 10 } }]
})
export default class extends GodfatherCommand {
	public async run(message: Message, args: Args) {
		const game = this.context.client.games.find((game) => Boolean(game.players.get(message.author)));
		if (!game) throw await message.resolveKey('preconditions:NoActiveGames');

		if (game.settings.disableWhispers) throw await message.resolveKey('commands/mafia:whisperDisabled');
		if (!game.hasStarted) throw await message.resolveKey('preconditions:GameStartedOnly');
		if (game.phase !== Phase.Day) throw await message.resolveKey('preconditions:whisperDayOnly');

		const player = game.players.get(message.author)!;
		// @ts-ignore Mayor
		if (player.role.name === 'Mayor' && player.role.hasRevealed) throw await message.resolveKey('commands/mafia:whisperAsRevealedMayor');
		if (!player.isAlive) throw await message.resolveKey('commands/mafia:whisperAsDeadPlayer');

		const target = await args.pick('player', { game }).catch(handleRequiredArg('player'));
		// @ts-ignore Mayor
		if (target.role.name === 'Mayor' && target.role.hasRevealed) throw await message.resolveKey('commands/mafia:whisperToRevealedMayor');
		if (!target.isAlive) throw await message.resolveKey('commands/mafia:whisperToDeadPlayer');
		const whisperContent = await args.rest('string').catch(handleRequiredArg('message'));

		const t = await message.fetchT();
		try {
			await target.user.send(t('commands/mafia:whisperText', { sender: message.author.tag, message: whisperContent }));
			await message.react('✅');
		} catch {
			return message.channel.send(t('commands/mafia:whisperFail', { target }));
		} finally {
			await game.channel.send(t('commands/mafia:whisperAlert', { sender: message.author.tag, target }));
		}
	}
}
