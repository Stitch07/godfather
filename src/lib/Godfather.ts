import '@lib/extenders';

import { LogLevel, SapphireClient } from '@sapphire/framework';
import { Collection, Guild, Message } from 'discord.js';
import Game from '@mafia/Game';
import SetupStore from '@mafia/SetupStore';
import { Branding } from './util/utils';
import { PGSQL_ENABLED, PREFIX, PRODUCTION } from '@root/config';
import GuildSettingRepository from './orm/repositories/GuildSettingRepository';
import GuildSettingsEntity from './orm/entities/GuildSettings';
import { getCustomRepository } from 'typeorm';
import SlashCommandStore from './structures/SlashCommandStore';

import '@sapphire/plugin-logger/register';

export default class Godfather extends SapphireClient {

	public games: Collection<string, Game> = new Collection();
	public setups: SetupStore;
	public slashCommands: SlashCommandStore;
	public release = PRODUCTION ? Branding.Release.Production : Branding.Release.Development;
	public ownerID: string | undefined = undefined;
	public settingsCache = new Map<string, GuildSettingsEntity>();
	public eventLoop!: NodeJS.Timeout;
	private _version = [1, 1, 0];
	public constructor() {
		super({
			caseInsensitiveCommands: true,
			logger: {
				level: PRODUCTION ? LogLevel.Info : LogLevel.Trace
			},
			ws: {
				intents: ['GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILDS', 'DIRECT_MESSAGES', 'GUILD_MESSAGE_REACTIONS']
			}
		});

		this.setups = new SetupStore();
		this.registerStore(this.setups);

		this.slashCommands = new SlashCommandStore();
		this.registerStore(this.slashCommands);

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
		return this.release === Branding.Release.Production
			? versionStr
			: `${versionStr}-${this.release}`;
	}

	public get invite() {
		return `https://discord.com/oauth2/authorize?client_id=${this.user!.id}&scope=bot%20applications.commands&permissions=402653200`;
	}

}
