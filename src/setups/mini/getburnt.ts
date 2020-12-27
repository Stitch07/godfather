import { SetupOptions } from '#mafia/Setup';
import BasicSetup from '#mafia/BasicSetup';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SetupOptions>({
	name: 'getburnt',
	roles: ['Vanilla x6', 'Arsonist', 'Jester']
})
export default class extends BasicSetup {

}
