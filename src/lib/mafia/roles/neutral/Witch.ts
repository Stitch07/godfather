import WitchFaction from '@mafia/factions/neutral/Witch';
import NightActionsManager, { Defence, NightActionPriority } from '@mafia/managers/NightActionsManager';
import type Player from '@mafia/structures/Player';
import { DoubleTargetAction } from '../../actions/mixins/DoubleTargetAction';
import type { NightAction } from '../../managers/NightAction';
import { ActionRole } from '../../structures/ActionRole';

class Witch extends ActionRole {
	public name = 'Witch';

	public faction = new WitchFaction();

	// whether the witch has been attacked already
	public attacked = false;
	public actions: NightAction[] = [new ControlAction(this)];

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/neutral:witchDescription');
	}

	public get defence() {
		return this.attacked ? Defence.None : Defence.Basic;
	}
}

Witch.categories = [...Witch.categories, 'Random Neutral', 'Neutral Evil', 'Evil'];

export default Witch;

export class ControlAction extends DoubleTargetAction {
	public name = 'witch';
	public priority = NightActionPriority.Witch;
	public witchSuccessful = false;

	public constructor(role: ActionRole) {
		super(role);
		this.actionText = this.game.t('roles/actions:witchText');
		this.flags = {
			canBlock: false	
		}
	}

	public setUp(actions: NightActionsManager, targets: Player[]) {
		const [targetOne, targetTwo] = targets;
		for (const action of actions) {
			if (!(action.flags?.canWitch ?? true)) continue;
			if (action.actor === targetOne) {
				if (action.target && !Array.isArray(action.target)) action.target = targetTwo;
				this.witchSuccessful = true;
			}
		}
	}

	public tearDown(actions: NightActionsManager, [target]: Player[]) {
		if (this.witchSuccessful) {
			target.queueMessage(this.game.t(`roles/neutral:controlAlert`, { role: this.role.name }));
			this.player.queueMessage(this.game.t('roles/neutral:witchMessage', { role: target.role.name }));
		}
	}

	public confirmation([player1, player2]: Player[]) {
		return this.game.t('roles/neutral:witchActionConfirmation', { player1, player2 });
	}
}
