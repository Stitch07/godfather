import NightActionsManager, { NightActionPriority } from '../../managers/NightActionsManager';
import type { ActionRole } from '../../structures/ActionRole';
import type Player from '../../structures/Player';
import { SingleTargetAction } from '../mixins/SingleTargetAction';

// Action to return all players that a target visited.
export class TrackAction extends SingleTargetAction {
	public name = 'track';
	public priority = NightActionPriority.Investigative;
	public constructor(role: ActionRole, remainingUses = Number.POSITIVE_INFINITY) {
		super(role, remainingUses);
		this.actionText = this.game.t('roles/actions:trackText');
		this.actionGerund = this.game.t('roles/actions:trackGerund');
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const visited = this.game.players.filter((player) => player.visitors.includes(target)).map(player => player.user.username);
		if (visited.length > 0) {
			return this.player.queueMessage(this.game.t('roles/town:trackResult', { players: visited }));
		}
	}
}
