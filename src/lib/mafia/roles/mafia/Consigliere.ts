import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import MafiaRole from '@mafia/mixins/MafiaRole';
import SingleTarget from '@mafia/mixins/SingleTarget';
import type Player from '@mafia/structures/Player';

class Consigliere extends SingleTarget {
	public name = 'Consigliere';

	public action = 'check';
	public priority = NightActionPriority.CONSIG;

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/neutral:consigliereDescription');
		this.actionText = this.game.t('roles/actions:consigliereText');
		this.actionGerund = this.game.t('roles/actions:consigliereGerund');
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		this.player.queueMessage(this.game.t('roles/mafia:consigResult', { role: target.role.display }));
	}
}

Consigliere.aliases = ['Consig'];
Consigliere.categories = [...Consigliere.categories, 'Mafia Support'];

export default MafiaRole(Consigliere);
