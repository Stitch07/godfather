import '@lib/extenders';
import type Game from '@mafia/structures/Game';
import SetupStore from '@mafia/structures/SetupStore';
import { BFD_API_TOKEN, PGSQL_ENABLED, PREFIX, PRODUCTION, TOPGG_API_TOKEN } from '@root/config';
import { LogLevel, SapphireClient } from '@sapphire/framework';
import { fetch } from '@util/utils';
import { Collection, Guild, Message } from 'discord.js';
import { DbSet } from './database/DbSet';
import ModifierStore from './mafia/structures/ModifierStore';

import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-i18next/register-discordjs';
import '@sapphire/plugin-i18next/register';

import type { FormatFunction } from 'i18next';
import { getHandler } from '@root/languages';
import { codeBlock, inlineCodeBlock } from '@sapphire/utilities';
import { UserOrMemberMentionRegex } from '@sapphire/discord-utilities';

export default class Godfather extends SapphireClient {
	public games: Collection<string, Game> = new Collection();
	public ownerID: string | undefined = undefined;
	public prefixCache = new Map<string, string>();
	public eventLoop!: NodeJS.Timeout;
	public maintenance = false;

	private _version = [1, 4, 0];
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
			loadDefaultErrorEvents: false,
			i18n: {
				defaultMissingKey: 'globals:default',
				defaultNS: 'globals',
				i18next: (_: string[], languages: string[]) => ({
					supportedLngs: languages,
					preload: languages,
					returnObjects: true,
					returnEmptyString: false,
					returnNull: false,
					load: 'all',
					fallbackLng: 'en-US',
					defaultNS: 'globals',
					overloadTranslationOptionHandler: (args) => ({ defaultValue: args[1] ?? 'globals:default' }),
					initImmediate: false,
					interpolation: {
						escapeValue: false,
						defaultVariables: {
							VERSION: this.version,
							GREENTICK: '✅'
						},
						format: (...[value, format, language, options]: Parameters<FormatFunction>) => {
							switch (format) {
								case 'listAnd': {
									return getHandler(language!).listAnd.format(value as string[]);
								}
								case 'codeBlock': {
									return codeBlock('txt', value);
								}
								case 'inlineCodeBlock': {
									return inlineCodeBlock(value);
								}
								case 'durationFormat': {
									return getHandler(language!).duration.format(Number(value));
								}
								case 'prefix': {
									if (UserOrMemberMentionRegex.test(value)) {
										return `@${this.user!.username} `;
									}
									return value;
								}
								default: {
									return value as string;
								}
							}
						}
					}
				})
			},
			ws: {
				intents: ['GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILDS', 'DIRECT_MESSAGES', 'GUILD_MESSAGE_REACTIONS']
			}
		});

		this.stores.register(new SetupStore());
		this.stores.register(new ModifierStore());

		this.stores.get('modifiers').registerPath(`${process.cwd()}/dist/lib/mafia/modifiers`);

		this.fetchPrefix = async (message: Message) => {
			if (!message.guild) return [PREFIX, ''];
			return this.fetchGuildPrefix(message.guild);
		};

		this.fetchLanguage = async (context) => {
			if (!context.guild) return 'en-US';
			const { guilds } = await DbSet.connect();
			const settings = await guilds.findOne(context.guild.id, {
				select: ['language']
			});
			return settings?.language ?? 'en-US';
		};
	}

	public async fetchGuildPrefix(guild: Guild) {
		if (!PGSQL_ENABLED) return PREFIX;
		if (this.prefixCache.has(guild.id)) return this.prefixCache.get(guild.id)!;

		const { guilds } = await DbSet.connect();
		const settings = await guilds.findOne(guild.id, {
			select: ['id', 'prefix']
		});
		const prefix = settings?.prefix ?? PREFIX;
		this.prefixCache.set(guild.id, prefix);

		return prefix;
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

	public async login(token: string) {
		await this.i18n.init();
		return super.login(token);
	}
}
