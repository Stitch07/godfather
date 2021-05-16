import NightActionsManager, { NightActionPriority } from '../../managers/NightActionsManager';
import type { ActionRole } from '../../structures/ActionRole';
import type Player from '../../structures/Player';
import { SingleTargetAction } from '../mixins/SingleTargetAction';

export class CleanAction extends SingleTargetAction {
	public name = 'clean';
	public priority = NightActionPriority.Clean;
	public constructor(role: ActionRole, remainingUses = Number.POSITIVE_INFINITY) {
		super(role, remainingUses);
		this.actionText = this.game.t('roles/actions:cleanText');
		this.actionGerund = this.game.t('roles/actions:cleanGerund');
	}

	public runAction(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id).get('nightkill');
		if (record.result) target.cleaned = true;
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id).get('nightkill');
		if (record.result && target.cleaned) {
			return this.player.queueMessage(this.game.t('roles/mafia:cleanResult', { role: target.role.name }));
		}
	}
}
