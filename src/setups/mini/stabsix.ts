import { SetupOptions } from '#mafia/Setup';
import BasicSetup from '#mafia/BasicSetup';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SetupOptions>({
	name: 'stabsix',
	roles: ['Random Town x4', 'Neutral Evil', 'Serial Killer']
})
export default class extends BasicSetup {

}
