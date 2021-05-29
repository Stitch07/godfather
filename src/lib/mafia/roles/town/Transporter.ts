import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';
import { TransportAction } from '../../actions/common/TransportAction';
import type { NightAction } from '../../managers/NightAction';
import { ActionRole } from '../../structures/ActionRole';

class Transporter extends ActionRole {
	public name = 'Transporter';
	public actions: NightAction[] = [new TransportAction(this)];

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:transporterDescription');
	}
}

Transporter.categories = [...Transporter.categories, 'Town Support'];

export default Townie(Transporter);
