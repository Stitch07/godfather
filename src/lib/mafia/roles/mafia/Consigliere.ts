import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import MafiaRole from '@mafia/mixins/MafiaRole';
import SingleTarget from '@mafia/mixins/SingleTarget';
import type Player from '@mafia/structures/Player';

class Consigliere extends SingleTarget {
	public name = 'Consigliere';
	public description = 'A corrupted investigator who has been bribed to gather information for Mafia.';

	public action = 'check';
	public actionGerund = 'investigating';
	public actionText = 'investigate a player';

	public priority = NightActionPriority.CONSIG;

	public tearDown(actions: NightActionsManager, target: Player) {
		this.player.queueMessage(`Your target's role is: ${target.role.display}`);
	}
}

Consigliere.aliases = ['Consig'];
Consigliere.categories = [...Consigliere.categories, 'Mafia Support'];

export default MafiaRole(Consigliere);
