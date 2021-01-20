import NightActionsManager, { Attack, NightActionPriority } from '@mafia/managers/NightActionsManager';
import Player from '@mafia/structures/Player';
import SingleTarget from '@mafia/mixins/SingleTarget';
import { cast, pluralize } from '@util/utils';
import Witch from '../roles/neutral/Witch';
import CultLeader from '../roles/cult/Cult_Leader';

export default class Killer extends SingleTarget {

	public action = 'shoot';
	public actionText = 'shoot a player';
	public actionGerund = 'shooting';
	public actionParticiple = 'shot';
	public shootingMechanism = 'bullet';
	public priority = NightActionPriority.KILLER;
	public bullets = Infinity;
	public flags = {
		canBlock: true,
		canTransport: true,
		canVisit: true
	};

	public canUseAction() {
		if (this.bullets === 0) return { check: false, reason: `You have 0 ${this.shootingMechanism}s left.` };
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
		const success = record.result === true && record.by.includes(this.player);
		if (!success) {
			return this.player.queueMessage('Your target was too strong to kill!');
		}
		return target.queueMessage(`You were ${this.actionParticiple} by a ${this.name}!`);
	}

	public get extraNightContext() {
		// Infinity bullets = no limit
		if (this.bullets > 0 && this.bullets !== Infinity) return `You have ${pluralize(this.bullets, 'shot')} remaining.`;
		return null;
	}

	public get attackStrength() {
		return this.modifiers.attack ?? Attack.Basic;
	}

}
