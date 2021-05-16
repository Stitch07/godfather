import NightActionsManager, { NightActionPriority } from '../../managers/NightActionsManager';
import type { ActionRole } from '../../structures/ActionRole';
import type Player from '../../structures/Player';
import { SingleTargetAction } from '../mixins/SingleTargetAction';

// Action to return all players that visited a target.
export class WatchAction extends SingleTargetAction {
	public name = 'watch';
	public priority = NightActionPriority.Investigative;
	public constructor(role: ActionRole, remainingUses = Number.POSITIVE_INFINITY) {
		super(role, remainingUses);
		this.actionText = this.game.t('roles/actions:watchText');
		this.actionGerund = this.game.t('roles/actions:watchGerund');
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const visitors = target.visitors.filter((visitor) => visitor !== this.player);
		if (visitors.length > 0)
			return this.player.queueMessage(this.game.t('roles/town:watchVisitedBy', { players: visitors.map((visitor) => visitor.user.username) }));
		return this.player.queueMessage(this.game.t('roles/town:watchNoVisits'));
	}
}
