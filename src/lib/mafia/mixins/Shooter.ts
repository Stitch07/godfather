import NightActionsManager, { Attack, NightActionCommand, NightActionPriority } from '@mafia/managers/NightActionsManager';
import Player from '@mafia/Player';
import ActionRole from '@mafia/mixins/ActionRole';

export default class Shooter extends ActionRole {

	public action = NightActionCommand.Shoot;
	public actionText = 'shoot a player';
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
		this.client.logger.debug('shooter called');
		this.bullets--;
		if (target.role.defense > this.attackStrength) return;
		actions.record.setAction(target.user.id, 'nightkill', { result: true, by: [this.player], type: Attack.Basic });
	}

	public get attackStrength() {
		return Attack.Basic;
	}

}
