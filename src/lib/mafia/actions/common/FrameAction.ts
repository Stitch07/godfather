import type Player from '@mafia/structures/Player';
import NightActionsManager, { NightActionPriority } from '../../managers/NightActionsManager';
import type { ActionRole } from '../../structures/ActionRole';
import { SingleTargetAction } from '../mixins/SingleTargetAction';

export class FrameAction extends SingleTargetAction {
	public name = 'frame';
	public priority = NightActionPriority.Frame;

	public constructor(role: ActionRole, numUsesRemaining = Number.POSITIVE_INFINITY) {
		super(role, numUsesRemaining);

		this.actionText = this.game.t('roles/actions:frameText');
		this.actionGerund = this.game.t('roles/actions:frameGerund');
	}

	public setUp(actions: NightActionsManager, target: Player) {
		actions.framedPlayers.push(target);
	}
}
