import type Player from '@mafia/structures/Player';
import { NeapolitanAction } from '../../actions/common/NeapolitanAction';
import type { NightAction } from '../../managers/NightAction';
import Townie from '../../mixins/Townie';
import { ActionRole } from '../../structures/ActionRole';

class Neapolitan extends ActionRole {
	public name = 'Neapolitan';
	public actions: NightAction[] = [new NeapolitanAction(this)];

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:neapolitanDescription');
	}
}

export default Townie(Neapolitan);
