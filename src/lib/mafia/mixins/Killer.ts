import NightActionsManager, { Attack, NightActionPriority } from '@mafia/managers/NightActionsManager';
import SingleTarget from '@mafia/mixins/SingleTarget';
import type Player from '@mafia/structures/Player';
import { cast } from '@util/utils';
import type CultLeader from '../roles/cult/Cult_Leader';
import type Witch from '../roles/neutral/Witch';

export default class Killer extends SingleTarget {
	public action = 'shoot';
	public priority = NightActionPriority.KILLER;
	public bullets = Infinity;
	public shootingMechanism: string;
	public actionParticiple: string;

	public constructor(player: Player) {
		super(player);
		this.shootingMechanism = this.game.t('roles/global:bullet');
		this.actionText = this.game.t('roles/actions:killerText');
		this.actionGerund = this.game.t('roles/actions:killerGerund');
		this.actionParticiple = this.game.t('roles/actions:killerParticiple');
	}

	public canUseAction() {
		if (this.bullets === 0)
			return { check: false, reason: this.game.t('roles/global:outOfBullets', { shootingMechanism: this.shootingMechanism }) };
		return super.canUseAction();
	}

	public runAction(actions: NightActionsManager, target: Player) {
		this.bullets--;
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
		return target.queueMessage(this.game.t('roles/global:killerMessage', { actionParticiple: this.actionParticiple, role: this.name }));
	}

	public get extraNightContext() {
		// Infinity bullets = no limit
		if (this.bullets > 0 && this.bullets !== Infinity)
			return this.game.t('roles/global:killerContext', {
				bullets: this.bullets === 1 ? this.game.t('roles/global:bullet') : this.game.t('roles/global:bulletPlural'),
				amount: this.bullets
			});
		return null;
	}

	public get attackStrength() {
		return this.modifiers.attack ?? Attack.Basic;
	}
}
