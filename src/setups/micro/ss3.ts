import { SetupOptions } from '@mafia/Setup';
import BasicSetup from '@mafia/BasicSetup';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<SetupOptions>({
	name: 'ss3',
	roles: ['Super Saint', 'Vanilla', 'Goon']
})
export default class extends BasicSetup {
}
