import NightActionsManager, { Attack, NightActionPriority } from '../../managers/NightActionsManager';
import Survivor from '../../roles/neutral/Survivor';
import type { ActionRole } from '../../structures/ActionRole';
import { NoTargetAction } from '../mixins/NoTargetAction';

/* A common vesting action BGs and Survivors can use */
export class VestAction extends NoTargetAction {
	public name = 'vest';
	public priority = NightActionPriority.Vest;
	public constructor(role: ActionRole, remainingUses = 1) {
		super(role, remainingUses);
		this.actionGerund = this.game.t('roles/actions:vestGerund');

		// TODO: potentially refactor vest texts
		if (role instanceof Survivor) {
			this.actionText = this.game.t('roles/actions:survivorText');
		} else if (remainingUses === 1) {
			this.actionText = this.game.t('roles/actions:vestText', { count: remainingUses });
		} else {
			this.actionText = this.game.t('roles/actions:vestTextPlural', { count: remainingUses });
		}
	}

	public canUse() {
		if (this.remainingUses === 0) return { check: false, reason: this.game.t('roles/actions:vestNoVests') };
		return super.canUse();
	}

	public tearDown(actions: NightActionsManager) {
		const playerRecord = actions.record.get(this.player.user.id);
		const kills = playerRecord.get('nightkill');

		if (kills.result && kills.type && kills.type <= Attack.Basic) {
			playerRecord.set('nightkill', { result: false, by: [] });
		}
	}

	public get extraNightContext() {
		return this.remainingUses === 0 ? this.game.t('roles/actions:vestCannotVest') : this.game.t('roles/actions:vestCanVest');
	}
}
