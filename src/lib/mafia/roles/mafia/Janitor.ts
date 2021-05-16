import MafiaRole from '@mafia/mixins/MafiaRole';
import type Player from '@mafia/structures/Player';
import { CleanAction } from '../../actions/common/CleanAction';
import type { NightAction } from '../../managers/NightAction';
import { ActionRole } from '../../structures/ActionRole';

class Janitor extends ActionRole {
	public name = 'Janitor';
	public actions: NightAction[] = [new CleanAction(this)];

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/neutral:janitorDescription');
	}
}

Janitor.categories = [...Janitor.categories, 'Mafia Deception'];

export default MafiaRole(Janitor);
