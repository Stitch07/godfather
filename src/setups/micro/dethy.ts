import { SetupOptions } from '@mafia/Setup';
import BasicSetup from '@mafia/BasicSetup';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SetupOptions>({
	name: 'dethy',
	roles: ['Naive Cop', 'Insane Cop', 'Paranoid Cop', 'Cop', 'Goon']
})
export default class extends BasicSetup {

	public description = 'not done';

}
