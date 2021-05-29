import MafiaRole from '@mafia/mixins/MafiaRole';
import type Player from '@mafia/structures/Player';
import { RoleCheckAction } from '../../actions/common/RoleCheckAction';
import type { NightAction } from '../../managers/NightAction';
import { ActionRole } from '../../structures/ActionRole';

class Consigliere extends ActionRole {
	public name = 'Consigliere';
	public actions: NightAction[] = [new RoleCheckAction(this)];

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/mafia:consigliereDescription');
	}
}

Consigliere.aliases = ['Consig'];
Consigliere.categories = [...Consigliere.categories, 'Mafia Support'];

export default MafiaRole(Consigliere);
