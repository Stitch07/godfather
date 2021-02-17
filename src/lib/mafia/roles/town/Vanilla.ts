import Townie from '@mafia/mixins/Townie';
import Role from '@mafia/structures/Role';
import type Player from '@mafia/structures/Player';

class Vanilla extends Role {
	public name = 'Vanilla';

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:vanillaDescription');
	}
}

export default Townie(Vanilla);
