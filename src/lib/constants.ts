import type { GameSettings } from '@mafia/structures/Game';
import { getHandler } from '@root/languages';
import type { ArgType } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import type { TFunction } from 'i18next';

export interface SettingsEntry<K extends keyof ArgType> {
	name: string;
	type: K;
	minimum?: unknown;
	maximum?: unknown;
	display: (value: any, t: TFunction) => string;
}

export const displayLng = (t: TFunction, value: number) => {
	const handler = getHandler(t.lng);
	return handler.duration.format(value);
};

export const DEFAULT_GAME_SETTINGS: GameSettings = {
	dayDuration: Time.Minute * 5,
	nightDuration: Time.Minute * 2,
	overwritePermissions: true,
	maxPlayers: 18,
	whispers: false,
	numberedNicknames: false,
	muteAtNight: false,
	adaptiveSlowmode: false,
	wills: false,
	trials: false,
	pluralityVotes: false, // This could be refactored into an enum. For now, don't enable both trials and plurality at once.
	maxTrials: 2
};

export const DEFAULT_ACTION_FLAGS = {
	canBlock: true,
	canTransport: true,
	canVisit: true,
	canWitch: true
};

export const STALEMATE_PRIORITY_ORDER = ['Escort', 'Goon', 'Transporter', 'Godfather', 'Serial Killer', 'Arsonist', 'Juggernaut'];

export const GUILD_SETTINGS_METADATA: SettingsEntry<keyof ArgType>[] = [
	{
		name: 'dayDuration',
		type: 'duration',
		minimum: 30 * Time.Second,
		maximum: 30 * Time.Minute,
		display: (value: number, t: TFunction) => displayLng(t, value)
	},
	{
		name: 'nightDuration',
		type: 'duration',
		minimum: 30 * Time.Second,
		maximum: 30 * Time.Minute,
		display: (value: number, t: TFunction) => displayLng(t, value)
	},
	{
		name: 'overwritePermissions',
		type: 'boolean',
		display: (value: boolean) => (value ? 'Enabled' : 'Disabled')
	},
	{
		name: 'maxPlayers',
		type: 'number',
		minimum: 3,
		maximum: 18,
		display: (value: number) => value.toString()
	},
	{
		name: 'whispers',
		type: 'boolean',
		display: (value: boolean) => (value ? 'Enabled' : 'Disabled')
	},
	{
		name: 'numberedNicknames',
		type: 'boolean',
		display: (value: boolean) => (value ? 'Enabled' : 'Disabled')
	},
	{
		name: 'muteAtNight',
		type: 'boolean',
		display: (value: boolean) => (value ? 'Enabled' : 'Disabled')
	},
	{
		name: 'adaptiveSlowmode',
		type: 'boolean',
		display: (value: boolean) => (value ? 'Enabled' : 'Disabled')
	},
	{
		name: 'wills',
		type: 'boolean',
		display: (value: boolean) => (value ? 'Enabled' : 'Disabled')
	},
	{
		name: 'trials',
		type: 'boolean',
		display: (value: boolean) => (value ? 'Enabled' : 'Disabled')
	},
	{
		name: 'maxTrials',
		type: 'number',
		minimum: 1,
		maximum: 5,
		display: (value: number) => value.toString()
	},
	{
		name: 'pluralityVotes',
		type: 'boolean',
		display: (value: boolean) => (value ? 'Enabled' : 'Disabled')
	}
];

export const factionEmojis: Record<string, string> = {
	Town: '<:townie:735134943507644436>',
	Mafia: '<:goon:735136200041562183>',
	Cult: '👥',
	Arsonist: '<:arso:735136511732744333>',
	Executioner: '<:exe:735136679408697375>',
	Jester: '🤡',
	'Serial Killer': '🔪',
	Survivor: '🏳️',
	Werewolf: '🐺',
	Witch: '🧹',
	'Guardian Angel': '😇',
	Juggernaut: '🥊'
};
