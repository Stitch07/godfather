import { Branding } from '@lib/util/utils';
import Game from '@mafia/Game';
import Player from '@mafia/Player';
import SetupStore from '@mafia/SetupStore';
import { Collection, Guild } from 'discord.js';

interface ChannelExtendables {
	readonly attachable: boolean;
	readonly embedable: boolean;
	readonly postable: boolean;
	readonly readable: boolean;
}


declare module 'discord.js' {
	interface Client {
		readonly release: Branding.Release;
		readonly version: string;
		readonly invite: string;
		ownerID: string | undefined;
		games: Collection<string, Game>;
		setups: SetupStore;
		fetchGuildPrefix(guild: Guild): Promise<string>;
	}

	interface TextChannel {
		prompt(promptMessage: string, promptUser: User): Promise<boolean>;
		readonly game: Game | undefined;
	}

	interface TextChannel extends ChannelExtendables { }

	interface DMChannel extends ChannelExtendables { }

	interface NewsChannel extends ChannelExtendables { }
}

declare module '@sapphire/framework' {
	interface ArgType {
		player: Player;
	}
}

