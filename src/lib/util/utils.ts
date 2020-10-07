import { promisify } from 'util';
import Player from '@mafia/Player';
import { PieceContext, PieceOptions, Piece } from '@sapphire/pieces';
import { Constructor } from '@sapphire/utilities';

export namespace Branding {
	export const PrimaryColor = '#000000';

	export const enum Release {
		Production = 'prod',
		Beta = 'beta',
		Development = 'dev'
	}
}

export const shuffle = <T>(array: readonly T[]): T[] => {
	const clone = array.slice();
	const shuffled = [];

	for (const { } of array) {
		const [value] = clone.splice(Math.floor(Math.random() * clone.length), 1);
		shuffled.push(value);
	}

	return shuffled;
};

export const randomArray = <T>(array: readonly T[]): T => array[Math.floor(Math.random() * array.length)];

export const aliveOrRecentJester = (player: Player) => {
	if (!player.isAlive && player.role!.name === 'Jester' && player.deathReason === `lynched d${player.game.cycle}`) return true;
	return player.isAlive;
};

export const sleep = promisify(setTimeout);

// The next 2 functions have been sourced from https://github.com/skyra-project/decorators
// Copyright © 2018-2020 Kyra
// #region skyra decorators
export function createClassDecorator<TFunction extends(...args: any[]) => void>(fn: TFunction): ClassDecorator {
	return fn;
}

export function ApplyOptions<T extends PieceOptions>(options: T): ClassDecorator {
	return createClassDecorator(
		(target: Constructor<Piece>) =>
			class extends target {

				public constructor(context: PieceContext, baseOptions: PieceOptions = {}) {
					super(context, { ...baseOptions, ...options });
				}

			}
	);
}
// #endregion
