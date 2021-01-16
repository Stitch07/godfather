import { exec as childProcessExec } from 'child_process';
import { promisify } from 'util';
import Player from '@mafia/structures/Player';
import { isThenable, regExpEsc } from '@sapphire/utilities';
import { Client, GuildMember } from 'discord.js';
import { Events, UserError } from '@sapphire/framework';
import { TOKEN } from '@root/config';

let sensitiveTokens: RegExp | null = null;

export const initClean = () => {
	const TOKENS = [process.cwd(), process.cwd().replace(/\\/g, '\\\\'), TOKEN];
	sensitiveTokens = new RegExp(TOKENS.map(regExpEsc).join('|'), 'gi');
};

export namespace Branding {
	export const PrimaryColor = '#000000';
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

export const fauxAlive = (player: Player) => {
	if (!player.isAlive && player.role!.name === 'Jester' && player.deathReason === `lynched D${player.game.cycle}`) return true;
	if (player.role.name === 'Guardian Angel' && player.role.canUseAction().check) return true;
	return player.isAlive;
};

export const sleep = promisify(setTimeout);

export const exec = promisify(childProcessExec);

export function floatPromise(client: Client, promise: Promise<unknown>) {
	if (isThenable(promise)) promise.catch(error => client.emit(Events.Error, error));
}

export const clean = (text: string) => text.replace(sensitiveTokens!, '「ｒｅｄａｃｔｅｄ」');

/**
 * Just an easier way of writing (value as T)
 * @param from The value to cast as
 */
export const cast = <T>(from: unknown) => (from as T);

/**
 * Python's enumerate()
 * @param array The array to iterate over
 */
export function *enumerate<T>(array: readonly T[]): Generator<[number, T]> {
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

export const pluralize = (count: number, singular: string, plural = `${singular}s`) => {
	if (count === 1) return `${count} ${singular}`;
	return `${count} ${plural}`;
};

export const canManage = (me: GuildMember, target: GuildMember) => {
	if (target.user.id === me.guild.ownerID) return false;
	if (me.roles.highest.position <= target.roles.highest.position) return false;
	return true;
};

export const handleRequiredArg = (name: string) => (error: UserError) => {
	if (error.identifier === 'MissingArguments') throw `Missing required argument: ${name}`;
	throw error.message;
};
