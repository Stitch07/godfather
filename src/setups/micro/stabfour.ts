import { SetupOptions } from '@mafia/structures/Setup';
import BasicSetup from '@mafia/structures/BasicSetup';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SetupOptions>({
	name: 'stabfour',
	roles: ['Random Town x3', 'Serial Killer']
})
export default class extends BasicSetup {

}
