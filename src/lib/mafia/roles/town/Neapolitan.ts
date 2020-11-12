import NightActionsManager, { NightActionPriority } from '../../managers/NightActionsManager';
import ActionRole from '@mafia/mixins/ActionRole';
import Townie from '@mafia/mixins/Townie';
import Player from '@mafia/Player';

class Neapolitan extends ActionRole {

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

export default Townie(Neapolitan);
