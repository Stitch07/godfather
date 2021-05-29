import NightActionsManager, { Attack, NightActionPriority } from '../../managers/NightActionsManager';
import type { ActionRole } from '../../structures/ActionRole';
import type Player from '../../structures/Player';
import { SingleTargetAction } from '../mixins/SingleTargetAction';

// Action to return all players that visited a target.
export class HexAction extends SingleTargetAction {
	public name = 'hex';
	public priority = NightActionPriority.KILLER;

	public constructor(role: ActionRole, remainingUses = Number.POSITIVE_INFINITY) {
		super(role, remainingUses);
		this.actionText = this.game.t('roles/actions:hexMasterText');
		this.actionGerund = this.game.t('roles/actions:hexMasterGerund');
		this.flags = {
			canBlock: true,
			canTransport: true,
			canVisit: false,
			canWitch: true
		};
	}

	public canUse(target: Player) {
		if (
			this.game.nightActions.hexedPlayers.length ===
			this.game.players.filter((player) => player.isAlive && player.role.faction.name !== 'Coven').length
		)
			return { check: false, reason: this.game.t('roles/coven:hexMasterEveryoneHexed') };
		return super.canUse(target);
	}

	public runAction(actions: NightActionsManager, target: Player) {
		actions.hexedPlayers.push(target);
		if (this.game.necronomiconWith === this.player) {
			const playerRecord = actions.record.get(target.user.id);
			playerRecord.set(target.user.id, { by: [this.player], result: true, type: Attack.Basic });
			target.queueMessage(this.game.t('roles/coven:hexMasterAlert'));
		}
	}
}
