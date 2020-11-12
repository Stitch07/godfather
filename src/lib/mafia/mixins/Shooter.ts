import NightActionsManager, { Attack, NightActionPriority } from '@mafia/managers/NightActionsManager';
import Player from '@mafia/Player';
import ActionRole from '@mafia/mixins/ActionRole';

export default class Shooter extends ActionRole {

	public action = 'shoot';
	public actionText = 'shoot a player';
	public actionGerund = 'shooting';
	public priority = NightActionPriority.Shooter;
	public bullets = Infinity;
	public flags = {
		canBlock: true,
		canTransport: true,
		canVisit: true
	};

	public runAction(actions: NightActionsManager, target: Player) {
		this.bullets--;
		if (target.role.defense > this.attackStrength) return;
		actions.record.setAction(target.user.id, 'nightkill', { result: true, by: [this.player], type: Attack.Basic });
	}

	public get attackStrength() {
		return Attack.Basic;
	}

}
