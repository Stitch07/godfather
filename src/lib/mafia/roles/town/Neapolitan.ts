import NightActionsManager, { NightActionPriority } from '../../managers/NightActionsManager';
import SingleTarget from '@root/lib/mafia/mixins/SingleTarget';
import Townie from '@mafia/mixins/Townie';
import Player from '@mafia/Player';

class Neapolitan extends SingleTarget {

	public name = 'Neapolitan';
	public description = 'Like a cop, but with less powerful investigations.';

	public action = 'check';
	public actionGerund = 'checking';
	public actionText = 'check a player';

	public priority = NightActionPriority.NEOPOLITAN;

	public async tearDown(actions: NightActionsManager, target: Player) {
		if (target.role.name.includes('Vanilla')) {
			await this.player.user.send('Your target is a Vanilla');
		} else {
			await this.player.user.send('Your target is not a Vanilla');
		}
	}

	public static documentation = 'Roleinfo docs here.';

}

Neapolitan.categories = [...Neapolitan.categories, 'Town Investigative'];

export default Townie(Neapolitan);
