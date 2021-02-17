import Game, { GameSettings } from '@mafia/structures/Game';
import type Player from '@mafia/structures/Player';
import type SetupStore from '@mafia/structures/SetupStore';
import type { Piece } from '@sapphire/framework';
import type { User } from 'discord.js';
import type ModifierStore from './lib/mafia/structures/ModifierStore';

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
		modifiers: ModifierStore;
		setups: SetupStore;
		prefixCache: Map<string, string>;
		eventLoop: NodeJS.Timeout;
		maintenance: boolean;
		fetchGuildPrefix(guild: Guild): Promise<string>;
		uploadBotStats(): Promise<void>;
	}

	interface TextChannel extends ChannelExtendables {}

	interface DMChannel extends ChannelExtendables {}

	interface NewsChannel extends ChannelExtendables {}

	interface Message {
		prompt(promptMessage: string): Promise<boolean>;
	}
}

declare module '@sapphire/framework' {
	interface ArgType {
		player: Player;
		gameSetting: keyof GameSettings;
		duration: number;
		piece: Piece;
	}

	interface StoreRegistryEntries {
		modifiers: ModifierStore;
		setups: SetupStore;
	}

	interface Command {
		category: string;
	}
}

declare module 'i18next' {
	export interface TFunction {
		lng: string;
		ns?: string;

		(
			...args:
				| [key: string, options?: TOptionsBase | string]
				| [key: string, defaultValue: string, options?: TOptionsBase | string]
				| [key: string, options?: TOptions<any>]
		): string;
	}
}
