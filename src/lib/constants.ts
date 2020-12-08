import { GameSettings } from '@mafia/Game';
import { ArgType } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { format } from './util/durationFormat';

export interface SettingsEntry<K extends keyof ArgType> {
	name: string;
	type: K;
	minimum?: unknown;
	maximum?: unknown;
	display: (value: any) => string;
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
	dayDuration: Time.Minute * 5,
	nightDuration: Time.Minute * 2,
	overwritePermissions: true,
	maxPlayers: 18,
	disableWhispers: false,
	numberedNicknames: false,
	muteAtNight: false,
	adaptiveSlowmode: false
};

export const DEFAULT_ACTION_FLAGS = {
	canBlock: true,
	canTransport: true,
	canVisit: true
};

export const STALEMATE_PRIORITY_ORDER = [
	'Escort',
	'Goon',
	'Transporter',
	'Godfather',
	'Serial Killer',
	'Arsonist'
];

export const GUILD_SETTINGS_METADATA: SettingsEntry<keyof ArgType>[] = [
	{
		name: 'dayDuration',
		type: 'duration',
		minimum: 30 * Time.Second,
		maximum: 30 * Time.Minute,
		display: (value: number) => format(value)
	},
	{
		name: 'nightDuration',
		type: 'duration',
		minimum: 30 * Time.Second,
		maximum: 30 * Time.Minute,
		display: (value: number) => format(value)
	},
	{
		name: 'overwritePermissions',
		type: 'boolean',
		display: (value: boolean) => value ? 'Enabled' : 'Disabled'
	},
	{
		name: 'maxPlayers',
		type: 'number',
		minimum: 3,
		maximum: 18,
		display: (value: number) => value.toString()
	},
	{
		name: 'disableWhispers',
		type: 'boolean',
		display: (value: boolean) => value ? 'Enabled' : 'Disabled'
	},
	{
		name: 'numberedNicknames',
		type: 'boolean',
		display: (value: boolean) => value ? 'Enabled' : 'Disabled'
	},
	{
		name: 'muteAtNight',
		type: 'boolean',
		display: (value: boolean) => value ? 'Enabled' : 'Disabled'
	},
	{
		name: 'adaptiveSlowmode',
		type: 'boolean',
		display: (value: boolean) => value ? 'Enabled' : 'Disabled'
	}
];

export const factionEmojis: Record<string, string> = {
	'Town': '<:townie:735134943507644436>',
	'Mafia': '<:goon:735136200041562183>',
	'Arsonist': '<:arso:735136511732744333>',
	'Executioner': '<:exe:735136679408697375>',
	'Jester': '🤡',
	'Serial Killer': '🔪',
	'Survivor': '🏳️',
	'Werewolf': '🐺',
	'Witch': '🧹',
	'Guardian Angel': '😇',
	'Juggernaut': '🥊'
};
