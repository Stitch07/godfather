import NightActionsManager, { NightActionPriority } from '../../managers/NightActionsManager';
import SingleTarget from '@root/lib/mafia/mixins/SingleTarget';
import Player from '@mafia/Player';
import TownFaction from '../../factions/Town';

export default class Neapolitan extends SingleTarget {

	public name = 'Neapolitan';
	public description = 'Like a cop, but with less powerful investigations.';
	public faction = new TownFaction();

	public action = 'check';
	public actionGerund = 'checking';
	public actionText = 'check a player';

	public priority = NightActionPriority.NEOPOLITAN;

	public async tearDown(actions: NightActionsManager, target: Player) {
		if (target.role.name.includes('Vanilla')) {
			await this.player.user.send('Your target is a Vanilla');
		} else {
			await this.player.user.send('Your target is not a Vanilla');
		}
	}

}
