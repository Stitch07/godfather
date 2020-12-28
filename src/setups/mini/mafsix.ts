import { SetupOptions } from '#mafia/structures/Setup';
import BasicSetup from '#mafia/structures/BasicSetup';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SetupOptions>({
	name: 'mafsix',
	roles: ['Random Town x4', 'Goon', 'Random Mafia']
})
export default class extends BasicSetup {

}
