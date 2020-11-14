import Shooter from '@mafia/mixins/Shooter';
import NightActionsManager, { Defense } from '@mafia/managers/NightActionsManager';
import Player from '@mafia/Player';
import SerialKillerFaction from '@mafia/factions/neutral/SerialKiller';

export default class Serial_Killer extends Shooter {

	public name = 'Serial Killer';
	public description = 'You may stab someone every night.';
	public faction = new SerialKillerFaction();
	public action = 'stab';
	public actionGerund = 'stabbing';
	public actionText = 'stab a player';

	public get defense() {
		return Defense.Basic;
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id).get('nightkill');
		const success = record.result && record.by.some(player => this.player.user.id === player.user.id);
		if (!success) {
			return this.player.user.send('Your target was too strong to kill!');
		}
		return target.user.send('You were stabbed by a Serial Killer. You have died!');
	}

}

Serial_Killer.aliases = ['SK'];
