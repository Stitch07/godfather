import '@lib/extenders';

import { join } from 'path';
import { LogLevel, SapphireClient } from '@sapphire/framework';
import { Collection, Guild, Message } from 'discord.js';
import Game from '@mafia/Game';
import SetupStore from '@mafia/SetupStore';
import { Branding } from './util/utils';

export default class Godfather extends SapphireClient {

	public games: Collection<string, Game> = new Collection();
	public setups: SetupStore;
	public release = Branding.Release.Development;
	public ownerID: string | undefined = undefined;
	private _version = [1, 0, 0];
	public constructor() {
		super({
			logger: {
				level: LogLevel.Debug
			}
		});

		this.setups = new SetupStore(this);
		this.registerStore(this.setups);
		this.fetchPrefix = (message: Message) => this.fetchGuildPrefix(message.guild);

		this.arguments.registerPath(join(__dirname, '..', 'arguments'));
		this.commands.registerPath(join(__dirname, '..', 'commands'));
		this.events.registerPath(join(__dirname, '..', 'events'));
		this.preconditions.registerPath(join(__dirname, '..', 'preconditions'));
	}

	// TODO: configurable prefixes
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public fetchGuildPrefix(guild: Guild | null) {
		return Promise.resolve('gd!');
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
