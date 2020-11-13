import Shooter from '@mafia/mixins/Shooter';
import NightActionsManager from '@mafia/managers/NightActionsManager';
import Player from '@mafia/Player';
import MafiaRole from '@mafia/mixins/MafiaRole';

class Goon extends Shooter {

	public name = 'Goon';
	public description = 'You may shoot someone every night.';

	public canUseAction() {
		if (this.game.setup!.name === 'dethy' && this.game.cycle === 1) {
			return { check: false, reason: 'You cannot use your action ' };
		}
		return super.canUseAction();
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id).get('nightkill');
		console.log(record, actions.record);
		const success = record.result && record.by.some(player => this.player.user.id === player.user.id);
		if (!success) {
			return this.player.user.send('Your target was too strong to kill!');
		}
		return target.user.send('You were shot by a Goon. You have died!');
	}

}

Goon.categories.push('Mafia Killing');
Goon.aliases = ['Mafioso'];

export default MafiaRole(Goon);
