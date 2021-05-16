import type Player from '@mafia/structures/Player';
import NightActionsManager, { NightActionPriority } from '../../managers/NightActionsManager';
import type { ActionRole } from '../../structures/ActionRole';
import { SingleTargetAction } from '../mixins/SingleTargetAction';

const VANILLA_ROLES = ['Cult Member', 'Vanilla', 'Vanilla Mafia'];

export class NeapolitanAction extends SingleTargetAction {
	public name = 'check';
	public priority = NightActionPriority.Investigative;
	public constructor(role: ActionRole, remainingUses = Number.POSITIVE_INFINITY) {
		super(role, remainingUses);
		this.actionText = this.game.t('roles/actions:neapolitanText');
		this.actionGerund = this.game.t('roles/actions:neapolitanGerund');
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		if (VANILLA_ROLES.includes(target.role.name)) {
			this.player.queueMessage(this.game.t('roles/town:neapolitanResultVanilla'));
		} else {
			this.player.queueMessage(this.game.t('roles/town:neapolitanResultNotVanilla'));
		}
	}
}
