import NightActionsManager, { Attack, NightActionPriority } from '@mafia/managers/NightActionsManager';
import type Player from '@mafia/structures/Player';
import { cast } from '@util/utils';
import type CultLeader from '@mafia/roles/cult/Cult_Leader';
import type Witch from '@mafia/roles/neutral/Witch';
import type { ActionRole } from '@mafia/structures/ActionRole';
import { SingleTargetAction } from '../mixins/SingleTargetAction';
import type { OneOrMultiplePlayers } from '../../managers/NightAction';
import Vigilante from '../../roles/town/Vigilante';
import Godfather from '../../roles/mafia/Godfather';
import Goon from '../../roles/mafia/Goon';

export default class KillerAction extends SingleTargetAction {
	public action: string;
	public priority = NightActionPriority.KILLER;
	public actionParticiple: string;
	public attackStrength: Attack;
	public shootingMechanism: string;

	public constructor(role: ActionRole, attack: Attack, actionName: string, remainingUses = Number.POSITIVE_INFINITY) {
		super(role, remainingUses);
		this.action = actionName;
		this.attackStrength = this.player.role.modifiers.attack ?? attack;
		this.actionText = this.game.t('roles/actions:killerText');
		this.actionGerund = this.game.t('roles/actions:killerGerund');
		this.actionParticiple = this.game.t('roles/actions:killerParticiple');
		this.shootingMechanism = this.game.t('roles/global:bullet');
	}

	public setUp(actions: NightActionsManager) {
		if (this.role instanceof Godfather) {
			const goonKills = actions.filter((action) => action.actor.role.name === 'Goon');
			// remove actions if the goon wasn't roleblocked
			if (goonKills.length > 0) {
				actions.splice(
					actions.findIndex((action) => action.actor === this.player),
					1
				);
			}
		}
	}

	public runAction(actions: NightActionsManager, target: Player) {
		if (target.role.actualDefence > this.attackStrength) {
			// witch defence: after attacked once, revert back to Basic
			if (['Witch', 'Cult Leader'].includes(target.role.name)) cast<Witch | CultLeader>(target.role).attacked = true;
			return;
		}
		actions.record.setAction(target.user.id, 'nightkill', { result: true, by: [this.player], type: this.attackStrength });
	}

	public canUse(target: OneOrMultiplePlayers) {
		if (this.role instanceof Goon && this.game.setup!.name === 'dethy' && this.game.cycle === 1) {
			return { check: false, reason: this.game.t('roles/mafia:goonDethy') };
		}
		if (this.remainingUses === 0)
			return { check: false, reason: this.game.t('roles/global:outOfBullets', { shootingMechanism: this.shootingMechanism }) };
		return super.canUse(target);
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		if (target.role.faction.name === 'Town' && this.role instanceof Vigilante) {
			cast<typeof Vigilante>(this.player.role).prototype.guilt = true;
		}
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
