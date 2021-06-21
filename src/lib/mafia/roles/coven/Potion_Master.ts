import CovenRole from '../../mixins/CovenRole';
import { ActionRole } from '../../structures/ActionRole';
import type Player from '../../structures/Player';

class PotionMaster extends ActionRole {
	public name = 'Potion Master';
	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:potionMasterDescription');
	}
}

export default CovenRole(PotionMaster);
