import Townie from '@mafia/mixins/Townie';
import Role from '@mafia/structures/Role';
import type Player from '@mafia/structures/Player';

class Innocent_Child extends Role {
	public name = 'Innocent Child';
	private playerName: string;

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:innocentChildDescription');
		this.playerName = this.player.user?.username;
	}

	public async init() {
		await this.game.channel.send(this.game.t('roles/town:innocentChildReveal', { player: this.playerName }));
	}
}

export default Townie(Innocent_Child);
