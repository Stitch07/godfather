import '@lib/extenders';

import { SapphireClient } from '@sapphire/framework';
import { Collection, Guild, Message } from 'discord.js';
import Game from '@mafia/Game';
import SetupStore from '@mafia/SetupStore';
import { Branding } from './util/utils';
import { PGSQL_DATABASE_USER, PREFIX } from '@root/config';
import GuildSettingRepository from './orm/repositories/GuildSettingRepository';
import Logger from './Logger';
import GuildSettingsEntity from './orm/entities/GuildSettings';
import { getCustomRepository } from 'typeorm';

export default class Godfather extends SapphireClient {

	public games: Collection<string, Game> = new Collection();
	public setups: SetupStore;
	public release = Branding.Release.Development;
	public ownerID: string | undefined = undefined;
	public settingsCache = new Map<string, GuildSettingsEntity>();
	public eventLoop!: NodeJS.Timeout;
	private _version = [1, 0, 0];
	public constructor() {
		super({
			logger: {
				instance: new Logger()
			}
		});

		this.setups = new SetupStore(this);
		this.registerStore(this.setups);
		this.fetchPrefix = async (message: Message) => {
			if (!message.guild) return [PREFIX, ''];
			return this.fetchGuildPrefix(message.guild);
		};

		this.registerUserDirectories();
	}

	// TODO: configurable prefixes
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async fetchGuildPrefix(guild: Guild) {
		if (String(PGSQL_DATABASE_USER) === '') return PREFIX;
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
		return `https://discord.com/oauth2/authorize?client_id=${this.user!.id}&scope=bot`;
	}

}
