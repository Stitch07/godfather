import { exec as childProcessExec } from 'child_process';
import { promisify } from 'util';
import Player from '@mafia/Player';
import { isThenable } from '@sapphire/utilities';
import { Client } from 'discord.js';
import { Events } from '@sapphire/framework';

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

export const exec = promisify(childProcessExec);

export function floatPromise(client: Client, promise: Promise<unknown>) {
	if (isThenable(promise)) promise.catch(error => client.emit(Events.Error, error));
}
