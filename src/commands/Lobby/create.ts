import { DEFAULT_GAME_SETTINGS } from '#lib/constants';
import GodfatherCommand from '#lib/GodfatherCommand';
import Game, { GameSettings } from '#mafia/structures/Game';
import Player from '#mafia/structures/Player';
import { PGSQL_ENABLED } from '#root/config';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, CommandContext, CommandOptions } from '@sapphire/framework';
import { debounce } from '@sapphire/utilities';
import { Time } from '@sapphire/time-utilities';
import { cast, listItems } from '#util/utils';
import { Guild, Message, MessageReaction, TextChannel, User } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['c', 'creategame'],
	description: 'Creates a game of mafia in the current channel.',
	detailedDescription: [
		'To join an existing game, use the `join` command.',
		'Hosts may delete running games using the `delete` command.'
	].join('\n'),
	preconditions: ['GuildOnly']
})
export default class extends GodfatherCommand {

	public async run(message: Message, args: Args, context: CommandContext) {
		if (this.context.client.games.has(message.channel.id)) {
			throw 'A game of Mafia is already running in this channel.';
		}
		// prevent players from joining 2 games simultaneously
		for (const otherGame of this.context.client.games.values()) {
			if (otherGame.players.get(message.author)) throw `You are already playing another game in ${otherGame.channel} (${otherGame.channel.guild.name})`;
		}

		const game = new Game(message.author, cast<TextChannel>(message.channel), await this.getSettings(message.guild!));
		game.createdAt = new Date();
		this.context.client.games.set(message.channel.id, game);
		const output = `Started a game of Mafia in <#${message.channel.id}> hosted by **${message.author.tag}**. Use ${context.prefix}join to join it.`;

		const reactMessage = await message.channel.send(output);
		// wait one minute for reactions to a message as a means of quickly joining it
		await reactMessage.react('✅');
		const playersAdded: User[] = [];

		const collector = reactMessage.createReactionCollector((reaction: MessageReaction, user: User) => !user.bot && reaction.emoji.name === '✅' && !game.players.get(user), {
			time: 45 * Time.Second
		});

		const debouncedFn = debounce(() => reactMessage.edit(`${output}\nAdded ${listItems(playersAdded.map(player => player.tag))}`), {
			maxWait: Time.Second * 2,
			wait: Time.Second
		});

		collector.on('collect', async (reaction, user) => {
			if (game.players.get(user) || game.players.length === game.settings.maxPlayers || game.hasStarted) return;
			for (const game of this.context.client.games.values()) {
				if (game.players.get(user)) return;
			}
			game.players.push(new Player(user, game));
			await debouncedFn();
		});

		collector.on('end', async () => {
			await reactMessage.reactions.removeAll().catch(() => null);
		});
	}

	private async getSettings(guild: Guild): Promise<GameSettings> {
		if (!PGSQL_ENABLED) return DEFAULT_GAME_SETTINGS;
		const settings = await guild.readSettings();
		return Object.assign({}, settings);
	}

}
