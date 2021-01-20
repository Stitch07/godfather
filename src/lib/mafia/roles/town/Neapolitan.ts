import NightActionsManager, { NightActionPriority } from '../../managers/NightActionsManager';
import SingleTarget from '@mafia/mixins/SingleTarget';
import Player from '@mafia/structures/Player';
import TownFaction from '../../factions/Town';

const VANILLA_ROLES = ['Cult Member', 'Vanilla', 'Vanilla Mafia'];

export default class Neapolitan extends SingleTarget {

	public name = 'Neapolitan';
	public description = 'Like a cop, but with less powerful investigations.';
	public faction = new TownFaction();

	public action = 'check';
	public actionGerund = 'checking';
	public actionText = 'check a player';

	public priority = NightActionPriority.NEOPOLITAN;

	public async tearDown(actions: NightActionsManager, target: Player) {
		if (VANILLA_ROLES.includes(target.role.name)) {
			await this.player.queueMessage('Your target is a Vanilla');
		} else {
			await this.player.queueMessage('Your target is not a Vanilla');
		}
	}

}
