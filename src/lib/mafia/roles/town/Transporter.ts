import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import DoubleTarget from '@mafia/mixins/DoubleTarget';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';
import { TransportAction } from '../../actions/common/TransportAction';
import type { NightAction } from '../../managers/NightAction';

class Transporter extends DoubleTarget {
	public name = 'Transporter';
	public actions: NightAction[] = [new TransportAction(this)];

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:transporterDescription');
	}
}

Transporter.categories = [...Transporter.categories, 'Town Support'];

export default Townie(Transporter);
