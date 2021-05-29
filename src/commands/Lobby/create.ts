import { DEFAULT_GAME_SETTINGS } from '@lib/constants';
import { DbSet } from '@lib/database/DbSet';
import GodfatherCommand from '@lib/GodfatherCommand';
import Game, { GameSettings } from '@mafia/structures/Game';
import Player from '@mafia/structures/Player';
import { PGSQL_ENABLED } from '@root/config';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args, CommandContext, CommandOptions } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { debounce, deepClone } from '@sapphire/utilities';
import { cast } from '@util/utils';
import type { Guild, Message, MessageReaction, TextChannel, User } from 'discord.js';

@ApplyOptions<CommandOptions>({
	generateDashLessAliases: true,
	aliases: ['c', 'create-game'],
	description: 'commands/help:createDescription',
	detailedDescription: 'commands/help:createDetailed',
	preconditions: ['GuildOnly']
})
export default class extends GodfatherCommand {
	public async run(message: Message, _: Args, context: CommandContext) {
		const t = await message.fetchT();
		if (this.context.client.games.has(message.channel.id)) {
			throw t('commands/lobby:gameExists');
		}
		// prevent players from joining 2 games simultaneously
		for (const otherGame of this.context.client.games.values()) {
			if (otherGame.players.get(message.author))
				throw t('commands/lobby:otherChannel', {
					channel: otherGame.channel.toString(),
					guild: otherGame.channel.guild.name
				});
		}

		if (message.author.id !== this.context.client.ownerID && this.context.client.maintenance) throw t('commands/lobby:createMaintenanceMode');

		const game = new Game(message.author, cast<TextChannel>(message.channel), await this.getSettings(message.guild!));
		game.createdAt = new Date();
		game.t = t;

		this.context.client.games.set(message.channel.id, game);
		const output = t('commands/lobby:createGameCreated', {
			// eslint-disable-next-line @typescript-eslint/no-base-to-string
			channel: message.channel.toString(),
			host: message.author.tag,
			prefix: context.prefix
		});

		const reactMessage = await message.channel.send(output);
		// wait one minute for reactions to a message as a means of quickly joining it
		await reactMessage.react('✅');
		let playersAdded: User[] = [];

		const collector = reactMessage.createReactionCollector(
			(reaction: MessageReaction, user: User) => !user.bot && reaction.emoji.name === '✅' && !game.players.get(user),
			{
				time: 45 * Time.Second
			}
		);

		// eslint-disable-next-line @typescript-eslint/no-base-to-string
		const debouncedFn = debounce(
			async () => {
				if (playersAdded.length) {

					await message.channel.send(t('commands/lobby:createPlayersAdded', { players: playersAdded.map((player) => player.tag) }));
					playersAdded = [];
				}
			},
			{
				maxWait: Time.Second * 2,
				wait: Time.Second
			}
		);

		collector.on('collect', async (_, user) => {
			if (game.players.get(user) || game.players.length === game.settings.maxPlayers || game.hasStarted) return;
			for (const game of this.context.client.games.values()) {
				if (game.players.get(user)) return;
			}
			game.players.push(new Player(user, game));
			playersAdded.push(user);
			await debouncedFn();
		});

		collector.on('end', async () => {
			await reactMessage.reactions.removeAll().catch(() => null);
		});
	}

	private async getSettings(guild: Guild): Promise<GameSettings> {
		if (!PGSQL_ENABLED) return DEFAULT_GAME_SETTINGS;
		const { guilds } = await DbSet.connect();
		const settings = await guilds.ensure(guild);
		return deepClone(settings);
	}
}
