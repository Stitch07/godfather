import type Player from '@mafia/structures/Player';
import NightActionsManager, { NightActionPriority } from '../../managers/NightActionsManager';
import type { ActionRole } from '../../structures/ActionRole';
import { SingleTargetAction } from '../mixins/SingleTargetAction';

export class RoleCheckAction extends SingleTargetAction {
	public name = 'check';
	public priority = NightActionPriority.Investigative;

	public constructor(role: ActionRole, numUsesRemaining = Number.POSITIVE_INFINITY) {
		super(role, numUsesRemaining);
		this.actionText = this.game.t('roles/actions:roleCheckText');
		this.actionGerund = this.game.t('roles/actions:roleCheckGerund');
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		this.player.queueMessage(this.game.t('roles/mafia:roleCheckResult', { role: target.role.display }));
	}
}
