import { SetupOptions } from '@mafia/Setup';
import BasicSetup from '@mafia/BasicSetup';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SetupOptions>({
	name: 'mafsix',
	roles: ['Random Town x4', 'Goon', 'Random Mafia']
})
export default class extends BasicSetup {

}
