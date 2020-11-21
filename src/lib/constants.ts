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
	maxPlayers: 18
};

export const DEFAULT_ACTION_FLAGS = {
	canBlock: true,
	canTransport: true,
	canVisit: true
};

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
	}
];
