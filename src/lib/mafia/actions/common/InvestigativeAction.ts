import NightActionsManager, { NightActionPriority } from '../../managers/NightActionsManager';
import type { ActionRole } from '../../structures/ActionRole';
import type Player from '../../structures/Player';
import { SingleTargetAction } from '../mixins/SingleTargetAction';

export enum InvestigativeActionType {
	Watch
}

export class InvestigativeAction extends SingleTargetAction {
	public priority = NightActionPriority.Investigative;
	public constructor(role: ActionRole, type: InvestigativeActionType, numUsesRemaining = Number.POSITIVE_INFINITY) {
		super(role, numUsesRemaining);

		switch (type) {
			case InvestigativeActionType.Watch:
				this.name = 'watch';
				this.actionText = this.game.t('roles/actions:watchText');
				this.actionGerund = this.game.t('roles/actions:watchGerund');
		}
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const visitors = target.visitors.filter((visitor) => visitor !== this.player);
		if (visitors.length > 0)
			return this.player.queueMessage(this.game.t('roles/town:watchVisitedBy', { players: visitors.map((visitor) => visitor.user.username) }));
		return this.player.queueMessage(this.game.t('roles/town:watchNoVisits'));
	}
}
