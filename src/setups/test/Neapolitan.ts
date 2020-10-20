import { SetupOptions } from '@mafia/Setup';
import BasicSetup from '@mafia/BasicSetup';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SetupOptions>({
	name: 'neo',
	roles: ['Goon', 'Vanilla', 'Neapolitan']
})
export default class extends BasicSetup {

	public description = 'Neapolitan';

}
