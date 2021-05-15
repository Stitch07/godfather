import { NightActionPriority } from '@mafia/managers/NightActionsManager';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';
import { InvestigativeAction, InvestigativeActionType } from '../../actions/common/InvestigativeAction';
import type { NightAction } from '../../managers/NightAction';
import { ActionRole } from '../../structures/ActionRole';

class Lookout extends ActionRole {
	public name = 'Lookout';
	public actions: NightAction[] = [new InvestigativeAction(this, InvestigativeActionType.Watch)];
	public action = 'watch';
	public priority = NightActionPriority.LOOKOUT;

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:lookoutDescription');
	}
}

Lookout.aliases = ['LO'];
Lookout.categories = [...Lookout.categories, 'Town Investigative'];

export default Townie(Lookout);
