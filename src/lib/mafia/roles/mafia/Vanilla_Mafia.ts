import MafiaRole from '@mafia/mixins/MafiaRole';
import Role from '@mafia/structures/Role';
import type Player from '@mafia/structures/Player';

class VanillaMafia extends Role {
	public name = 'Vanilla Mafia';

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/mafia:vanillaMafiaDescription');
	}
}

VanillaMafia.aliases = [...VanillaMafia.aliases, 'Mafia Vanilla'];

export default MafiaRole(VanillaMafia);
