import Townie from '@mafia/mixins/Townie';
import Role from '@mafia/structures/Role';
import type Player from '@mafia/structures/Player';

class Mason extends Role {
	public name = 'Mason';
	public masonryIndex!: number;

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:masonDescription');
	}

	public resolveRoleGroup(roleGroupIndex: number) {
		this.masonryIndex = roleGroupIndex;
	}
}

export default Townie(Mason);
