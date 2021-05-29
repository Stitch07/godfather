import NightActionsManager, { NightActionPriority } from '../../managers/NightActionsManager';
import type { ActionRole } from '../../structures/ActionRole';
import type Player from '../../structures/Player';
import { SingleTargetAction } from '../mixins/SingleTargetAction';

export class BlockAction extends SingleTargetAction {
	public name = 'block';
	public actionText = 'block a player';
	public actionGerund = 'blocking';
	public priority = NightActionPriority.ESCORT;

	public constructor(role: ActionRole, remainingUses = Number.POSITIVE_INFINITY) {
		super(role, remainingUses);
		this.actionText = this.game.t('roles/actions:escortText');
		this.actionGerund = this.game.t('roles/actions:escortGerund');
	}

	public setUp(actions: NightActionsManager, target: Player) {
		for (const action of actions.filter((act) => act.actor === target)) {
			if (!(action.flags?.canBlock ?? true)) continue;
			// escorts blocking SKs get stabbed instead
			if (action.actor.role.name === 'Serial Killer') {
				action.target = this.player;
				continue;
			}
			actions.splice(actions.indexOf(action), 1);
			actions.record.setAction(target.user.id, 'roleblock', { result: true, by: [this.player] });
		}
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id).get('roleblock');
		const success = record.result && record.by.includes(this.player);
		if (success) return target.queueMessage(this.game.t('roles/town:escortSuccess'));
	}
}
