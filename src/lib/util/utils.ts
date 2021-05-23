import type Player from '@mafia/structures/Player';
import { TOKEN } from '@root/config';
import { Events, UserError } from '@sapphire/framework';
import { isThenable, regExpEsc } from '@sapphire/utilities';
import { exec as childProcessExec } from 'child_process';
import type { Client, GuildMember } from 'discord.js';
import { promisify } from 'util';

import nodeFetch, { RequestInit } from 'node-fetch';
import { QueryError } from '../errors/QueryError';
import { ActionRole } from '../mafia/structures/ActionRole';

let sensitiveTokens: RegExp | null = null;

export const initClean = () => {
	const TOKENS = [process.cwd(), process.cwd().replace(/\\/g, '\\\\'), TOKEN];
	sensitiveTokens = new RegExp(TOKENS.map(regExpEsc).join('|'), 'gi');
};

export const shuffle = <T>(array: readonly T[]): T[] => {
	const clone = array.slice();
	const shuffled = [];

	for (const {} of array) {
		const [value] = clone.splice(Math.floor(Math.random() * clone.length), 1);
		shuffled.push(value);
	}

	return shuffled;
};

export const randomArrayItem = <T>(array: readonly T[]): T | null => {
	if (array.length === 0) return null;
	return array[Math.floor(Math.random() * array.length)];
};

export const getRandomInteger = () => {
	return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
};

export const fauxAlive = (player: Player) => {
	if (!player.isAlive && player.role!.name === 'Jester' && player.deathReason === `eliminated D${player.game.cycle}`) return true;
	if (player.role.name === 'Guardian Angel' && (player.role instanceof ActionRole) && player.role.canUseAction().check) return true;
	return player.isAlive;
};

export const sleep = promisify(setTimeout);

export const exec = promisify(childProcessExec);

export function floatPromise(client: Client, promise: Promise<unknown>) {
	if (isThenable(promise)) promise.catch((error) => client.emit(Events.Error, error));
}

export const clean = (text: string) => text.replace(sensitiveTokens!, '「ｒｅｄａｃｔｅｄ」');

/**
 * Just an easier way of writing (value as T)
 * @param from The value to cast as
 */
export const cast = <T>(from: unknown) => from as T;

/**
 * Removes an item from an array
 * @param array The array to modify
 * @param element A callback returning the element to remove
 */
export const removeArrayItem = <T>(array: T[], element: (value: T, index?: number, obj?: T[]) => unknown) => {
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

export const fetch = async (url: URL | string, options?: RequestInit) => {
	const response = await nodeFetch(url, options);
	if (!response.ok) throw new QueryError(url, response.status, response.statusText);
	return response;
};
