import { SetupOptions } from '@mafia/structures/Setup';
import BasicSetup from '@mafia/structures/BasicSetup';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SetupOptions>({
	name: 'stabsix',
	roles: ['Random Town x4', 'Neutral Evil', 'Serial Killer']
})
export default class extends BasicSetup {

}
