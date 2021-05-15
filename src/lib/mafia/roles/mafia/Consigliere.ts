import MafiaRole from '@mafia/mixins/MafiaRole';
import type Player from '@mafia/structures/Player';
import { ActionRole } from '../../structures/ActionRole';

class Consigliere extends ActionRole {
	public name = 'Consigliere';

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/neutral:consigliereDescription');
	}
}

Consigliere.aliases = ['Consig'];
Consigliere.categories = [...Consigliere.categories, 'Mafia Support'];

export default MafiaRole(Consigliere);
