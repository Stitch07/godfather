import SingleTarget from '@mafia/mixins/SingleTarget';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';
import { InvestigationAction } from '../../actions/common/InvestigationAction';
import type { NightAction } from '../../managers/NightAction';

class Investigator extends SingleTarget {
	public name = 'Investigator';
	public actions: NightAction[] = [new InvestigationAction(this)];

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:investigatorDescription');
	}
}

Investigator.aliases = ['Invest'];
Investigator.categories = [...Investigator.categories, 'Town Investigative'];

export default Townie(Investigator);
