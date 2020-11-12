import { exec as childProcessExec } from 'child_process';
import { promisify } from 'util';
import Player from '@mafia/Player';
import { isThenable, regExpEsc } from '@sapphire/utilities';
import { Client } from 'discord.js';
import { Events } from '@sapphire/framework';
import { TOKEN } from '@root/config';

const TOKENS = [process.cwd(), process.cwd().replace(/\\/g, '\\\\'), TOKEN];
const sensitiveTokens = new RegExp(TOKENS.map(regExpEsc).join('|'), 'gi');

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

export const randomArray = <T>(array: readonly T[]): T | null => {
	if (array.length === 0) return null;
	return array[Math.floor(Math.random() * array.length)];
};

export const aliveOrRecentJester = (player: Player) => {
	if (!player.isAlive && player.role!.name === 'Jester' && player.deathReason === `lynched d${player.game.cycle}`) return true;
	return player.isAlive;
};

export const sleep = promisify(setTimeout);

export const exec = promisify(childProcessExec);

export function floatPromise(client: Client, promise: Promise<unknown>) {
	if (isThenable(promise)) promise.catch(error => client.emit(Events.Error, error));
}

export const clean = (text: string) => text.replace(sensitiveTokens, '「ｒｅｄａｃｔｅｄ」');

/**
 * Just an easier way of writing (value as T)
 * @param from The value to cast as
 */
export const cast = <T>(from: unknown) => (from as T);

/**
 * Python's enumerate()
 * @param array The array to iterate over
 */
export function *enumerate <T>(array: readonly T[]): Generator<[number, T]> {
	for (let i = 0; i < array.length; i++) {
		yield [i, array[i]];
	}
}

/**
 * Removes an element from an array
 * @param array The array to modify
 * @param element A callback returning the element to remove
 */
export const remove = <T>(array: T[], element: (value: T, index?: number, obj?: T[]) => unknown) => {
	const index = array.findIndex(element);
	if (index !== -1) array.splice(index, 1);
};

export const listItems = (array: string[]) => {
	switch (array.length) {
		case 0:
			throw new Error('Wrongly called.');
		case 1:
			return array[0];
		default: {
			const lastEle = array.pop()!;
			return `${array.join(', ')} and ${lastEle}`;
		}
	}
};
