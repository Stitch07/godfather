import { DEFAULT_GAME_SETTINGS } from '#lib/constants';
import { GameSettings } from '#mafia/structures/Game';
import { Argument, ArgumentResult } from '@sapphire/framework';

export default class extends Argument<keyof GameSettings> {

	public run(argument: string): ArgumentResult<keyof GameSettings> {
		if (!Reflect.has(DEFAULT_GAME_SETTINGS, argument)) return this.error('ArgumentGameSettingInvalidKey', `"${argument}" is not a valid game setting.`);
		return this.ok(argument as keyof GameSettings);
	}

}
