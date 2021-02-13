import SerialKillerFaction from '@mafia/factions/neutral/SerialKiller';
import { Defence } from '@mafia/managers/NightActionsManager';
import Killer from '@mafia/mixins/Killer';
import type Player from '@mafia/structures/Player';

export default class Serial_Killer extends Killer {
	public name = 'Serial Killer';
	public faction = new SerialKillerFaction();
	public action = 'stab';

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/neutral:serialKillerDescription');
		this.actionText = this.game.t('roles/actions:serialKillerText');
		this.actionGerund = this.game.t('roles/actions:serialKillerGerund');
		this.actionParticiple = this.game.t('roles/neutral:serialKillerParticiple');
	}

	public get defence() {
		return Defence.Basic;
	}
}

Serial_Killer.aliases = ['SK'];
Serial_Killer.categories = [...Serial_Killer.categories, 'Neutral Killing', 'Evil'];
