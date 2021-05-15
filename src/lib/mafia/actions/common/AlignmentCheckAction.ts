import type Player from '@mafia/structures/Player';
import NightActionsManager, { NightActionPriority } from '../../managers/NightActionsManager';
import type { ActionRole } from '../../structures/ActionRole';
import { SingleTargetAction } from '../mixins/SingleTargetAction';

export class AlignmentCheckAction extends SingleTargetAction {
	public name = 'check';
	public priority = NightActionPriority.Investigative;

	public constructor(role: ActionRole) {
		super(role);

		this.actionText = this.game.t('roles/actions:copText');
		this.actionGerund = this.game.t('roles/actions:copGerund');
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		let innocence = this.innocenceModifier(target.role.modifiers.innocence ?? target.role.innocence);
		if (actions.framedPlayers.includes(target)) {
			innocence = !innocence;
			actions.framedPlayers.splice(actions.framedPlayers.indexOf(target), 1);
		}
		return this.player.queueMessage(this.game.t(innocence ? 'roles/town:copResultInnocent' : 'roles/town:copResultSuspicious'));
	}

	public innocenceModifier(innocence: boolean) {
		// dethy cops can use this
		return innocence;
	}
}
