import { SetupOptions } from '@mafia/Setup';
import BasicSetup from '@mafia/BasicSetup';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SetupOptions>({
	name: 'vigtest',
	roles: ['Vigilante', 'Vanilla', 'Goon']
})

export default class extends BasicSetup {

	public description = 'this is a test for rad\'s vigilante role!';

}
