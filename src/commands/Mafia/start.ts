import GodfatherCommand from '@lib/GodfatherCommand';
import { Phase } from '@mafia/structures/Game';
import type Player from '@mafia/structures/Player';
import { canManage } from '@root/lib/util/utils';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args, CommandContext, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['s', 'startgame'],
	description: 'commands/help:startDescription',
	detailedDescription: 'commands/help:startDetailed',
	preconditions: ['GuildOnly', 'GameOnly', 'HostOnly']
})
export default class extends GodfatherCommand {
	public async run(message: Message, args: Args, context: CommandContext) {
		const setupName = await args.rest('string').catch(() => '');
		const { game } = message.channel;

		if (game!.hasStarted) throw await message.resolveKey('commands/mafia:startAlreadyStarted');

		if (!game!.setup && setupName === '') {
			// attempt to find a setup
			// TODO: prompt for multiple setups here
			const foundSetup = this.context.client.stores.get('setups').find((setup) => setup.totalPlayers === game?.players.length);
			if (!foundSetup) throw await message.resolveKey('commands/mafia:startNoSetups', { playerCount: game!.players.length });
			game!.setup = foundSetup!;
		} else if (setupName !== '') {
			const foundSetup = this.context.client.stores.get('setups').find((setup) => setup.name === setupName.toLowerCase());
			if (!foundSetup) throw await message.resolveKey('commands/mafia:startSetupNotFound', { name: setupName });
			game!.setup = foundSetup;
		}

		if (game!.setup!.totalPlayers !== game!.players.length)
			throw await message.resolveKey('commands/mafia:startWrongPlayercount', { setup: game!.setup!.name, playerCount: game!.players!.length });

		if (game!.settings.numberedNicknames && message.guild!.me?.hasPermission('MANAGE_NICKNAMES')) {
			for (const plr of game!.players) {
				const member = await message.guild!.members.fetch(plr.user.id)!;
				// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
				const pos = game!.players.indexOf(plr) + 1;
				if (message.guild!.me && canManage(message.guild!.me, member)) {
					await member
						.setNickname(`[${pos}] ${member!.displayName}`)
						.then(() => game!.numberedNicknames.add(member))
						.catch(() => null);
				}
			}
		}

		const t = await message.fetchT();
		const sent = await message.channel.send(t('commands/mafia:startSetupChosen', { setup: game!.setup!.name }));
		game!.phase = Phase.Standby;
		const generatedRoles = game!.setup!.generate(this.context.client);
		for (const player of game!.players) {
			const { role, modifiers } = generatedRoles.shift()!;
			player.role = new role(player);
			for (const { modifier, context } of modifiers) {
				if (modifier.canPatch(player.role)) modifier.patch(player.role, context);
			}
		}

		const noPms: Player[] = [];
		for (const player of game!.players) {
			try {
				await player.sendPM();
			} catch (error) {
				this.context.client.logger.error(error);
				noPms.push(player);
			}
			await player.role.init();
		}

		await sent.edit(t('commands/mafia:startSentRolePms'));
		if (noPms.length > 0) {
			await message.channel.send(
				t('commands/mafia:startDmFail', { players: noPms.map((player) => player.toString()), prefix: context.prefix })
			);
		}

		if (game!.setup!.nightStart) {
			game!.cycle++;
			return game!.startNight();
		}
		return game!.startDay();
	}
}
