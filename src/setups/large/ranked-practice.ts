import BasicSetup from '@mafia/structures/BasicSetup';
import type { SetupOptions } from '@mafia/structures/Setup';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SetupOptions>({
	name: 'rankedpractice',
	roles: [
		'Town Investigative x2',
		'Town Killing',
		'Town Protective',
		'Random Town x4',
		'Town Support',
		'Godfather',
		'Goon',
		'Random Mafia x2',
		'Neutral Evil',
		'Neutral Killing'
	]
})
export default class extends BasicSetup {}
