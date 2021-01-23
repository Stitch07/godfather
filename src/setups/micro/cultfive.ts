import BasicSetup from '@mafia/structures/BasicSetup';
import type { SetupOptions } from '@mafia/structures/Setup';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SetupOptions>({
	name: 'cultfive',
	roles: ['Cult Leader', 'Random Town - {Ret;Reanimator} x4']
})
export default class extends BasicSetup {}
