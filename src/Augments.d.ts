import Game, { GameSettings } from '#mafia/structures/Game';
import Player from '#mafia/structures/Player';
import SetupStore from '#mafia/structures/SetupStore';
import { Piece } from '@sapphire/framework';
import { Collection, Guild, User } from 'discord.js';
import GuildSettingsEntity from './lib/orm/entities/GuildSettings';
import SlashCommandStore from './lib/structures/SlashCommandStore';

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
		readonly version: string;
		readonly invite: string;
		ownerID: string | undefined;
		games: Collection<string, Game>;
		setups: SetupStore;
		settingsCache: Map<string, GuildSettingsEntity>;
		slashCommands: SlashCommandStore;
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
		piece: Piece;
	}
}

