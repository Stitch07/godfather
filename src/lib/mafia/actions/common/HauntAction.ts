import { randomArrayItem } from '@root/lib/util/utils';
import NightActionsManager, { Attack, NightActionEntry, NightActionPriority } from '../../managers/NightActionsManager';
import type { ActionRole } from '../../structures/ActionRole';
import type Player from '../../structures/Player';
import { SingleTargetAction } from '../mixins/SingleTargetAction';

export class HauntAction extends SingleTargetAction {
	public name = 'haunt';
	public priority = NightActionPriority.Haunt;

	public constructor(role: ActionRole, public potentialTargets: Player[], remainingUses = 1) {
		super(role, remainingUses);
		this.actionText = this.game.t('roles/actions:jesterText');
		this.actionGerund = this.game.t('roles/actions:jesterGerund');
	}

	public runAction(actions: NightActionsManager, target: Player) {
		actions.record.setAction(target.user.id, 'nightkill', { by: [this.player], result: true, type: Attack.Unstoppable });
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		return target.queueMessage(this.game.t('roles/neutral:jesterHaunt'));
	}

	public canUse(target: Player) {
		if (this.potentialTargets.some((player) => player.user.id === target.user.id)) return { check: true, reason: '' };
		return { check: false, reason: this.game.t('roles/neutral:jesterVotersOnly') };
	}

	public get defaultAction(): NightActionEntry | undefined {
		const randomHaunt = randomArrayItem(this.potentialTargets);
		if (randomHaunt) {
			return {
				actor: this.player,
				target: randomHaunt,
				priority: this.priority,
				action: this
			};
		}
	}
}
