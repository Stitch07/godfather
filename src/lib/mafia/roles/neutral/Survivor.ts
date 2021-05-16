import SurivorFaction from '@mafia/factions/neutral/Survivor';
import type Player from '@mafia/structures/Player';
import { VestAction } from '../../actions/common/VestAction';
import { ActionRole } from '../../structures/ActionRole';

export default class Survivor extends ActionRole {
	public name = 'Survivor';
	public faction = new SurivorFaction();

	public constructor(player: Player) {
		super(player);
		const vests = this.game ? this.getInitialVests() : 0;
		this.actions = [new VestAction(this, vests)];
		this.description = this.game.t('roles/neutral:survivorDescription', { count: vests });
	}

	private getInitialVests() {
		if (this.game.players.length <= 5) return 1;
		if (this.game.players.length <= 10) return 2;
		return 4;
	}
}

Survivor.aliases = ['Surv'];
Survivor.categories = [...Survivor.categories, 'Random Neutral', 'Neutral Benign'];
