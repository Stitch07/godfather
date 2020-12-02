import NightActionsManager, { Attack, NightActionPriority } from '@mafia/managers/NightActionsManager';
import Player from '@mafia/Player';
import SingleTarget from '@root/lib/mafia/mixins/SingleTarget';

export default class Killer extends SingleTarget {

	public action = 'shoot';
	public actionText = 'shoot a player';
	public actionGerund = 'shooting';
	public actionParticiple = 'shot';
	public priority = NightActionPriority.KILLER;
	public bullets = Infinity;
	public flags = {
		canBlock: true,
		canTransport: true,
		canVisit: true
	};

	public runAction(actions: NightActionsManager, target: Player) {
		this.bullets--;
		if (target.role.defense > this.attackStrength) return;
		actions.record.setAction(target.user.id, 'nightkill', { result: true, by: [this.player], type: this.attackStrength });
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id).get('nightkill');
		const success = record.result === true && record.by.includes(this.player);
		if (!success) {
			return this.player.user.send('Your target was too strong to kill!');
		}
		return target.user.send(`You were ${this.actionParticiple} by a ${this.name}. You have died!`);
	}

	public get attackStrength() {
		return Attack.Basic;
	}

}
