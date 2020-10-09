import { SetupOptions } from '@mafia/Setup';
import BasicSetup from '@mafia/BasicSetup';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SetupOptions>({
	name: 'ss3',
	roles: ['Super Saint', 'Vanilla', 'Mafia Vanilla']
})
export default class extends BasicSetup {
}
