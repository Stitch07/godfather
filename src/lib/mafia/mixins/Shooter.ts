import NightActionsManager, { Attack, NightActionCommand, NightActionPriority } from '../managers/NightActionsManager';
import Player from '../Player';
import ActionRole from './ActionRole';

export default class Shooter extends ActionRole {

	public action = NightActionCommand.Shoot;
	public actionText = 'shoot a plater';
	public actionGerund = 'shooting';
	public priority = NightActionPriority.Shooter;
	public bullets = Infinity;
	public flags = {
		canBlock: true,
		canTransport: true,
		canVisit: true
	};

	// eslint-disable-next-line @typescript-eslint/require-await
	public async runAction(actions: NightActionsManager, target: Player) {
		this.bullets--;
		if (target.role.defense > this.attackStrength) return;
		actions.record.setAction(target.user.id, 'nightkill', { result: true, by: [this.player], type: Attack.Basic });
	}

	public get attackStrength() {
		return Attack.Basic;
	}

}
