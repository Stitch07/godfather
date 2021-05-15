import NightActionsManager, { Attack, NightActionPriority } from '@mafia/managers/NightActionsManager';
import type Player from '@mafia/structures/Player';
import { cast } from '@util/utils';
import type CultLeader from '@mafia/roles/cult/Cult_Leader';
import type Witch from '@mafia/roles/neutral/Witch';
import type { ActionRole } from '@mafia/structures/ActionRole';
import { SingleTargetAction } from '../mixins/SingleTargetAction';

export default class KillerAction extends SingleTargetAction {
	public action: string;
	public priority = NightActionPriority.KILLER;
	public actionParticiple: string;
	public attackStrength: Attack;

	public constructor(role: ActionRole, attack: Attack, actionName: string) {
		super(role);
		this.action = actionName;
		this.attackStrength = this.player.role.modifiers.attack ?? attack;
		this.actionText = this.game.t('roles/actions:killerText');
		this.actionGerund = this.game.t('roles/actions:killerGerund');
		this.actionParticiple = this.game.t('roles/actions:killerParticiple');
	}

	public runAction(actions: NightActionsManager, target: Player) {
		if (target.role.actualDefence > this.attackStrength) {
			// witch defence: after attacked once, revert back to Basic
			if (['Witch', 'Cult Leader'].includes(target.role.name)) cast<Witch | CultLeader>(target.role).attacked = true;
			return;
		}
		actions.record.setAction(target.user.id, 'nightkill', { result: true, by: [this.player], type: this.attackStrength });
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id).get('nightkill');
		const success = record.result && record.by.includes(this.player);
		if (!success) {
			return this.player.queueMessage(this.game.t('roles/global:targetTooStrong'));
		}
		return target.queueMessage(
			this.game.t('roles/global:killerMessage', { actionParticiple: this.actionParticiple, role: this.player.role.name })
		);
	}
}
