import '@lib/extenders';

import type Game from '@mafia/structures/Game';
import SetupStore from '@mafia/structures/SetupStore';
import { BFD_API_TOKEN, PGSQL_ENABLED, PREFIX, PRODUCTION, TOPGG_API_TOKEN } from '@root/config';
import { LogLevel, SapphireClient } from '@sapphire/framework';
import '@sapphire/plugin-logger/register';
import { fetch } from '@util/utils';
import { Collection, Guild, Message } from 'discord.js';
import { getCustomRepository } from 'typeorm';
import ModifierStore from './mafia/structures/ModifierStore';
import type GuildSettingsEntity from './orm/entities/GuildSettings';
import GuildSettingRepository from './orm/repositories/GuildSettingRepository';
import SlashCommandStore from './structures/SlashCommandStore';

export default class Godfather extends SapphireClient {
	public games: Collection<string, Game> = new Collection();
	public setups: SetupStore;
	public slashCommands: SlashCommandStore;
	public ownerID: string | undefined = undefined;
	public settingsCache = new Map<string, GuildSettingsEntity>();
	public eventLoop!: NodeJS.Timeout;
	private _version = [1, 2, 2];
	public constructor() {
		super({
			caseInsensitiveCommands: true,
			logger: {
				level: PRODUCTION ? LogLevel.Info : LogLevel.Trace,
				defaultFormat: {
					timestamp: {
						utc: false
					}
				}
			},
			ws: {
				intents: ['GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILDS', 'DIRECT_MESSAGES', 'GUILD_MESSAGE_REACTIONS']
			}
		});

		this.setups = new SetupStore();
		this.registerStore(this.setups);

		this.slashCommands = new SlashCommandStore();
		this.registerStore(this.slashCommands);

		this.modifiers = new ModifierStore();
		this.registerStore(this.modifiers);
		this.modifiers.registerPath(`${process.cwd()}/dist/lib/mafia/modifiers`);

		this.fetchPrefix = async (message: Message) => {
			if (!message.guild) return [PREFIX, ''];
			return this.fetchGuildPrefix(message.guild);
		};
	}

	public async fetchGuildPrefix(guild: Guild) {
		if (!PGSQL_ENABLED) return PREFIX;
		const guildSettings: GuildSettingsEntity = await getCustomRepository(GuildSettingRepository).ensure(this, guild);
		return guildSettings.prefix;
	}

	public get version() {
		const versionStr = this._version.join('.');
		return PRODUCTION ? versionStr : `${versionStr}-dev`;
	}

	public get invite() {
		return `https://discord.com/oauth2/authorize?client_id=${this.user!.id}&scope=bot%20applications.commands&permissions=402653200`;
	}

	public async uploadBotStats() {
		if (TOPGG_API_TOKEN) {
			await fetch(`https://top.gg/api/bots/${this.id}/stats`, {
				headers: {
					Authorization: TOPGG_API_TOKEN,
					'Content-Type': 'application/json'
				},
				method: 'POST',
				body: JSON.stringify({
					server_count: this.guilds.cache.size
				})
			})
				.then(() => this.logger.debug('Posted statistics to top.gg.'))
				.catch((error) => this.logger.error('Error posting top.gg statistics', error));
		}

		if (BFD_API_TOKEN) {
			await fetch(`https://botsfordiscord.com/api/bot/${this.id}`, {
				headers: {
					Authorization: BFD_API_TOKEN,
					'Content-Type': 'application/json'
				},
				method: 'POST',
				body: JSON.stringify({
					server_count: this.guilds.cache.size
				})
			})
				.then(() => this.logger.debug('Posted statistics to BFD.'))
				.catch((error) => this.logger.error('Error posting BFD statistics', error));
		}
	}
}
