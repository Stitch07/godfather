import SingleTarget from '@mafia/mixins/SingleTarget';
import type Player from '@mafia/structures/Player';
import TownFaction from '../../factions/Town';
import NightActionsManager, { NightActionPriority } from '../../managers/NightActionsManager';

const VANILLA_ROLES = ['Cult Member', 'Vanilla', 'Vanilla Mafia'];

export default class Neapolitan extends SingleTarget {
	public name = 'Neapolitan';
	public faction = new TownFaction();
	public action = 'check';
	public priority = NightActionPriority.NEOPOLITAN;

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:neapolitanDescription');
		this.actionText = this.game.t('roles/actions:neapolitanText');
		this.actionGerund = this.game.t('roles/actions:neapolitanGerund');
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		if (VANILLA_ROLES.includes(target.role.name)) {
			this.player.queueMessage(this.game.t('roles/town:neapolitanResultVanilla'));
		} else {
			this.player.queueMessage(this.game.t('roles/town:neapolitanResultNotVanilla'));
		}
	}
}
