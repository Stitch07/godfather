import { SetupOptions } from '@mafia/Setup';
import BasicSetup from '@mafia/BasicSetup';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<SetupOptions>({
	name: 'coptest',
	roles: ['Vanilla', 'Vanilla', 'Alignment Cop', 'Mafia Vanilla']
})
export default class extends BasicSetup {
}
