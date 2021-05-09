import Townie from '../../mixins/Townie';
import type Player from '../../structures/Player';
import Role from '../../structures/Role';

class Bulletproof extends Role {
	public name = 'Bulletproof';
	private isBulletproof = true;

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:bulletproofDescription');
	}

	public afterActions() {
		if (!this.isBulletproof) return;
		// check if the BP got hit and save him one time
		const playerRecord = this.game.nightActions.record.get(this.player.user.id);
		const nightKills = playerRecord.get('nightkill');

		if (nightKills.result) {
			nightKills.result = false;
			nightKills.by = [];
			this.player.queueMessage(this.game.t('roles/town:bulletproofVestActivated'));
			this.isBulletproof = false;
		}
	}

	public onNight() {
		if (this.isBulletproof) return this.player.user.send(this.game.t('roles/town:bulletproofVestEnabled'));
	}
}

export default Townie(Bulletproof);
