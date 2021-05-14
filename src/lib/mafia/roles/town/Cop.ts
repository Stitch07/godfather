import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';
import { SingleTargetAction } from '../../actions/mixins/SingleTargetAction';
import type { NightAction } from '../../managers/NightAction';
import { ActionRole } from '../../structures/ActionRole';

class Cop extends ActionRole {
	public name = 'Cop';
	public actions: NightAction[] = [new CopCheckAction(this)];

	public constructor(player: Player) {
		super(player);

		this.description = this.game.t('roles/town:copDescription');
	}

	// ensures that Dethy cops don't get PMed their real role
	public get display(): string {
		if (this.player.cleaned && !this.player.isAlive) return 'Cleaned';
		return 'Cop';
	}
}

Cop.categories = [...Cop.categories, 'Town Investigative'];

export class CopCheckAction extends SingleTargetAction {
	public name = 'check';
	public priority = NightActionPriority.COP;

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

export default Townie(Cop);
