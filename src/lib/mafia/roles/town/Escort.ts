import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';
import { BlockAction } from '../../actions/common/BlockAction';
import type { NightAction } from '../../managers/NightAction';
import { ActionRole } from '../../structures/ActionRole';

class Escort extends ActionRole {
	public name = 'Escort';
	public actions: NightAction[] = [new BlockAction(this)];

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:escortDescription');
	}
}

Escort.categories = [...Escort.categories, 'Town Support'];

export default Townie(Escort);
