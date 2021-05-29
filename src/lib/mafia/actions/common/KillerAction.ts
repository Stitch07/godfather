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
import Juggernaut from '../../roles/neutral/Juggernaut';
import Werewolf from '../../roles/neutral/Werewolf';
import Serial_Killer from '../../roles/neutral/Serial_Killer';

export default class KillerAction extends SingleTargetAction {
	public priority = NightActionPriority.KILLER;
	public actionParticiple: string;
	public attackStrength: Attack;
	public shootingMechanism: string;

	public constructor(role: ActionRole, attack: Attack, actionName: string, remainingUses = Number.POSITIVE_INFINITY) {
		super(role, remainingUses);
		this.attackStrength = attack;
		if (role instanceof Serial_Killer) {
			this.actionText = this.game.t('roles/actions:serialKillerText');
			this.actionGerund = this.game.t('roles/actions:serialKillerGerund');
			this.actionParticiple = this.game.t('roles/actions:serialKillerParticiple');
		} else {
			this.actionText = this.game.t('roles/actions:killerText');
			this.actionGerund = this.game.t('roles/actions:killerGerund');
			this.actionParticiple = this.game.t('roles/actions:killerParticiple');
		}
		this.shootingMechanism = this.game.t('roles/global:bullet');
		this.name = actionName;
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
		if (this.role instanceof Werewolf && target === this.player) return;

		if (target.role.actualDefence > this.attackStrength) {
			// witch defence: after attacked once, revert back to Basic
			if (['Witch', 'Cult Leader'].includes(target.role.name)) cast<Witch | CultLeader>(target.role).attacked = true;
			return;
		}
		actions.record.setAction(target.user.id, 'nightkill', { result: true, by: [this.player], type: this.attackStrength });

		// Rampage.
		if (this.role instanceof Werewolf || (this.role instanceof Juggernaut && cast<Juggernaut>(this.role).level >= 2)) {
			const visitors = target.visitors.filter((player) => player.user.id !== this.player.user.id);
			for (const visitor of visitors) {
				if (visitor.role.actualDefence > this.attackStrength) continue;
				actions.record.setAction(visitor.user.id, 'nightkill', { result: true, by: [this.player], type: this.attackStrength });

				if (this.role instanceof Werewolf) {
					this.player.queueMessage(this.game.t('roles/neutral:juggernautAttackVisitors'));
					visitor.queueMessage(this.game.t('roles/neutral:juggernautAssault'));
				} else {
					visitor.queueMessage(this.game.t('roles/neutral:werewolfMaul'));
				}
			}
		}
	}

	public canUse(target: OneOrMultiplePlayers) {
		if (this.role instanceof Goon && this.game.setup!.name === 'dethy' && this.game.cycle === 1) {
			return { check: false, reason: this.game.t('roles/mafia:goonDethy') };
		}
		if (this.role instanceof Werewolf && target === this.player && this.player.isAlive) return { check: true, reason: '' };
		if (this.role instanceof Werewolf && cast<Werewolf>(this.role).canRampage())
			return { check: false, reason: this.game.t('roles/neutral:werewolfFullMoons') };
		if (this.remainingUses === 0)
			return { check: false, reason: this.game.t('roles/global:outOfBullets', { shootingMechanism: this.shootingMechanism }) };
		return super.canUse(target);
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		if (target.role.faction.name === 'Town' && this.role instanceof Vigilante) {
			cast<InstanceType<typeof Vigilante>>(this.role).guilt = true;
		}
		const record = actions.record.get(target.user.id).get('nightkill');
		const success = record.result && record.by.includes(this.player);
		if (!success) {
			return this.player.queueMessage(this.game.t('roles/global:targetTooStrong'));
		}

		if (this.role instanceof Juggernaut) {
			const role = cast<Juggernaut>(this.role);
			role.level++;
			if (role.level === 3) {
				this.attackStrength = Attack.Unstoppable;
			}
		}

		return target.queueMessage(
			this.game.t('roles/global:killerMessage', { actionParticiple: this.actionParticiple, role: this.player.role.name })
		);
	}

	public get extraNightContext() {
		if (this.role instanceof Vigilante) {
			const bulletsRemaining = this.remainingUses;
			// Infinity bullets = no limit
			if (bulletsRemaining > 0 && bulletsRemaining !== Infinity)
				return this.game.t('roles/global:killerContext', {
					bullets: bulletsRemaining === 1 ? this.game.t('roles/global:bullet') : this.game.t('roles/global:bulletPlural'),
					amount: bulletsRemaining
				});
		} else if (this.role instanceof Juggernaut)
			return this.game.t('roles/neutral:juggernautContext', { level: cast<Juggernaut>(this.role).level });
		return null;
	}
}
