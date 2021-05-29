import type { NightAction } from '../../managers/NightAction';
import NightActionsManager, { Attack, Defence } from '../../managers/NightActionsManager';
import CovenRole from '../../mixins/CovenRole';
import { ActionRole } from '../../structures/ActionRole';
import type Player from '../../structures/Player';
import { ControlAction } from '../neutral/Witch';

class CovenLeader extends ActionRole {
	public name = 'Coven Leader';
	public actions: NightAction[] = [new CovenLeaderControlAction(this)];

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/coven:covenLeaderDescription');
	}

	public get defence() {
		return this.game.necronomiconWith === this.player ? Defence.Basic : Defence.None;
	}

	public confirmation([player1, player2]: Player[]) {
		return this.game.t('roles/neutral:witchActionConfirmation', { player1, player2 });
	}
}

class CovenLeaderControlAction extends ControlAction {
	public name = 'control';

	public runAction(actions: NightActionsManager, [target]: Player[]) {
		if (this.witchSuccessful && this.game.necronomiconWith?.user.id === this.player.user.id) {
			if (target.role.actualDefence < Defence.Basic) {
				actions.record.setAction(target.user.id, 'nightkill', { result: true, by: [this.player], type: Attack.Basic });
			}
		}
	}
}

export default CovenRole(CovenLeader);
