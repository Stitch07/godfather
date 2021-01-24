import BasicSetup from '@mafia/structures/BasicSetup';
import type { SetupOptions } from '@mafia/structures/Setup';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SetupOptions>({
	name: 'stabsix',
	roles: ['Random Town x4', 'Neutral Evil', 'Serial Killer']
})
export default class extends BasicSetup {}
