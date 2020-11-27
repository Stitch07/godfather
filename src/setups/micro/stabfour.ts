import { SetupOptions } from '@mafia/Setup';
import BasicSetup from '@mafia/BasicSetup';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SetupOptions>({
	name: 'stabfour',
	roles: ['Random Town x3', 'Serial Killer']
})
export default class extends BasicSetup {

}
