import BasicSetup from '@mafia/structures/BasicSetup';
import type { SetupOptions } from '@mafia/structures/Setup';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SetupOptions>({
	name: 'mafnine',
	roles: ['Town Investigative', 'Town Protective', 'Random Town x4', 'Goon', 'Random Mafia - {Goon;GF;Mafia Vanilla} x2']
})
export default class extends BasicSetup {}
