import NightActionsManager, { NightActionPriority } from '../../managers/NightActionsManager';
import type { ActionRole } from '../../structures/ActionRole';
import type Player from '../../structures/Player';
import { DoubleTargetAction } from '../mixins/DoubleTargetAction';

/* this could be used with a Bus Driver too */
export class TransportAction extends DoubleTargetAction {
	public name = 'transport';
	public priority = NightActionPriority.TRANSPORTER;

	public constructor(role: ActionRole) {
		super(role);
		this.actionText = this.game.t('roles/actions:transporterText');
		this.actionGerund = this.game.t('roles/actions:transporterGerund');
	}

	public setUp(actions: NightActionsManager, targets: Player[]) {
		const [targetOne, targetTwo] = targets;
		for (const action of actions) {
			if (!action.flags?.canTransport) continue;
			if (action.target && action.target === targetOne) action.target = targetTwo;
			else if (action.target && action.target === targetTwo) action.target = targetOne;
		}
	}

	public tearDown(actions: NightActionsManager, targets: Player[]) {
		for (const target of targets) {
			target.queueMessage(this.game.t('roles/town:transporterMessage'));
		}
	}
}
