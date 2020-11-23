import Killer from '@mafia/mixins/Killer';
import { Defense } from '@mafia/managers/NightActionsManager';
import SerialKillerFaction from '@mafia/factions/neutral/SerialKiller';

export default class Serial_Killer extends Killer {

	public name = 'Serial Killer';
	public description = 'You may stab someone every night.';
	public faction = new SerialKillerFaction();
	public action = 'stab';
	public actionGerund = 'stabbing';
	public actionText = 'stab a player';
	public actionParticiple = 'stabbed';

	public get defense() {
		return Defense.Basic;
	}

}

Serial_Killer.aliases = ['SK'];
Serial_Killer.categories = [...Serial_Killer.categories, 'Neutral Killing', 'Evil'];
