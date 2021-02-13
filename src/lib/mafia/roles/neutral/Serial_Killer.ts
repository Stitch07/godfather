import SerialKillerFaction from '@mafia/factions/neutral/SerialKiller';
import { Defence } from '@mafia/managers/NightActionsManager';
import Killer from '@mafia/mixins/Killer';
import type Player from '@mafia/structures/Player';

export default class Serial_Killer extends Killer {
	public name = 'Serial Killer';
	public faction = new SerialKillerFaction();
	public action = 'stab';
	public actionGerund = 'stabbing';
	public actionText = 'stab a player';
	public actionParticiple = 'stabbed';

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/neutral:serialKillerDescription');
	}

	public get defence() {
		return Defence.Basic;
	}
}

Serial_Killer.aliases = ['SK'];
Serial_Killer.categories = [...Serial_Killer.categories, 'Neutral Killing', 'Evil'];
