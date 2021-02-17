import CultFaction from '@mafia/factions/Cult';
import Role from '@mafia/structures/Role';
import type Player from '@mafia/structures/Player';

class CultMember extends Role {
	public name = 'Cult Member';
	public faction = new CultFaction();

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:cultMemberDescription');
	}
}

CultMember.aliases = ['CM'];

export default CultMember;
