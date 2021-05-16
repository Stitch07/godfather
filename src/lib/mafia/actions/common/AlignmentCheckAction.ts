import type Player from '@mafia/structures/Player';
import NightActionsManager, { NightActionPriority } from '../../managers/NightActionsManager';
import type Cop from '../../roles/town/Cop';
import type { ActionRole } from '../../structures/ActionRole';
import { SingleTargetAction } from '../mixins/SingleTargetAction';

export class AlignmentCheckAction extends SingleTargetAction {
	public name = 'check';
	public priority = NightActionPriority.Investigative;

	public constructor(role: ActionRole, numUsesRemaining = Number.POSITIVE_INFINITY) {
		super(role, numUsesRemaining);

		this.actionText = this.game.t('roles/actions:alignmentCheckText');
		this.actionGerund = this.game.t('roles/actions:alignmentCheckGerund');
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		let innocence = (this.role as InstanceType<typeof Cop>).innocenceModifier(target.role.modifiers.innocence ?? target.role.innocence);
		if (actions.framedPlayers.includes(target)) {
			innocence = !innocence;
			actions.framedPlayers.splice(actions.framedPlayers.indexOf(target), 1);
		}
		return this.player.queueMessage(
			this.game.t(innocence ? 'roles/town:alignmentCheckResultInnocent' : 'roles/town:alignmentCheckResultSuspicious')
		);
	}
}
