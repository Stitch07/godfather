import BasicSetup from '@mafia/structures/BasicSetup';
import type { SetupOptions } from '@mafia/structures/Setup';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SetupOptions>({
	name: 'mafeight',
	roles: ['Town Investigative', 'Random Town x4', 'Neutral Evil', 'Goon', 'Random Mafia - {Goon;GF;Mafia Vanilla}']
})
export default class extends BasicSetup {}
