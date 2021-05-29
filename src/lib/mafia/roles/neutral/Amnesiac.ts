import AmnesiacFaction from '@mafia/factions/neutral/Amnesiac';
import type Player from '@mafia/structures/Player';
import { RememberAction } from '../../actions/common/RememberAction';
import type { NightAction } from '../../managers/NightAction';
import { ActionRole } from '../../structures/ActionRole';

export default class Amnesiac extends ActionRole {
	public name = 'Amnesiac';
	public actions: NightAction[] = [new RememberAction(this)];
	public faction = new AmnesiacFaction();

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/neutral:amnesiacDescription');
	}
}

Amnesiac.aliases = ['Amne'];
Amnesiac.categories = [...Amnesiac.categories, 'Random Neutral', 'Neutral Benign'];
