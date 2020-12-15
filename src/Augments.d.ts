import { Branding } from '@lib/util/utils';
import Game, { GameSettings } from '@mafia/Game';
import Player from '@mafia/Player';
import SetupStore from '@mafia/SetupStore';
import { Collection, Guild, User } from 'discord.js';
import GuildSettingsEntity from './lib/orm/entities/GuildSettings';

interface ChannelExtendables {
	readonly attachable: boolean;
	readonly embedable: boolean;
	readonly postable: boolean;
	readonly readable: boolean;
	prompt(promptMessage: string, promptUser: User): Promise<boolean>;
	readonly game: Game | undefined;
}


declare module 'discord.js' {
	interface Client {
		readonly release: Branding.Release;
		readonly version: string;
		readonly invite: string;
		ownerID: string | undefined;
		games: Collection<string, Game>;
		setups: SetupStore;
		settingsCache: Map<string, GuildSettingsEntity>;
		eventLoop: NodeJS.Timeout;
		fetchGuildPrefix(guild: Guild): Promise<string>;
	}

	interface TextChannel extends ChannelExtendables { }

	interface DMChannel extends ChannelExtendables { }

	interface NewsChannel extends ChannelExtendables { }

	interface Message {
		prompt(promptMessage: string): Promise<boolean>;
	}

	interface Guild {
		readSettings(): Promise<GuildSettingsEntity>;
		updateSettings(newSettings: GuildSettingsEntity): Promise<void>;
	}
}

declare module '@sapphire/framework' {
	interface ArgType {
		player: Player;
		gameSetting: keyof GameSettings;
		duration: number;
	}
}

