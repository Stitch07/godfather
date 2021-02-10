import { DEFAULT_GAME_SETTINGS } from '@lib/constants';
import type { GameSettings } from '@mafia/structures/Game';
import { Argument, ArgumentResult } from '@sapphire/framework';

export default class extends Argument<keyof GameSettings> {
	public run(parameter: string): ArgumentResult<keyof GameSettings> {
		if (!Reflect.has(DEFAULT_GAME_SETTINGS, parameter))
			return this.error({
				identifier: 'gameSetting',
				parameter
			});
		return this.ok(parameter as keyof GameSettings);
	}
}
