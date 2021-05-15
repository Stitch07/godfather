import SerialKillerFaction from '@mafia/factions/neutral/SerialKiller';
import { Attack, Defence } from '@mafia/managers/NightActionsManager';
import type Player from '@mafia/structures/Player';
import { ActionRole } from '../../structures/ActionRole';
import type { NightAction } from '../../managers/NightAction';
import KillerAction from '@root/lib/mafia/actions/common/KillerAction';

export default class Serial_Killer extends ActionRole {
	public name = 'Serial Killer';
	public faction = new SerialKillerFaction();
	public actions: NightAction[] = [new KillerAction(this, Attack.Basic, 'stab')];

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/neutral:serialKillerDescription');
		// this.actionText = this.game.t('roles/actions:serialKillerText');
		// this.actionGerund = this.game.t('roles/actions:serialKillerGerund');
		// this.actionParticiple = this.game.t('roles/neutral:serialKillerParticiple');
	}

	public get defence() {
		return Defence.Basic;
	}
}

Serial_Killer.aliases = ['SK'];
Serial_Killer.categories = [...Serial_Killer.categories, 'Random Neutral', 'Neutral Killing', 'Evil'];
