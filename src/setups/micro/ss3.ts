import { SetupOptions } from '@mafia/Setup';
import BasicSetup from '@mafia/BasicSetup';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SetupOptions>({
	name: 'ss3',
	roles: ['Super Saint', 'Vanilla', 'Goon']
})
export default class extends BasicSetup {

	public description = 'Super Saint 3 (https://wiki.mafiascum.net/index.php?title=SS3)';

}
