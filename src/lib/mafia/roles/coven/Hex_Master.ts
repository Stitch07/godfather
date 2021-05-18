import CovenRole from '@mafia/mixins/CovenRole';
import { Attack, NightActionPriority } from '@mafia/managers/NightActionsManager';
import type Player from '@mafia/structures/Player';
import { ActionRole } from '../../structures/ActionRole';

class HexMaster extends ActionRole {
	public name = 'Hex Master';
	public action = 'hex';
	public priority = NightActionPriority.KILLER;

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/coven:hexMasterDescription');
	}

	public onNight() {
		if (
			this.game.nightActions.hexedPlayers.length ===
			this.game.players.filter((player) => player.isAlive && player.role.faction.name !== 'Coven').length
		) {
			for (const plr of this.game.players.filter((player) => player.isAlive && player.role.faction.name !== 'Coven')) {
				if (plr.role.actualDefence > Attack.Unstoppable) {
					return super.onNight();
				}
				this.game.nightActions.record.setAction(plr.user.id, 'nightkill', { result: true, by: [this.player], type: Attack.Unstoppable });
			}
			this.player.queueMessage(this.game.t('roles/coven:hexMasterFinalHex'));
		}

		return super.onNight();
	}
}

HexMaster.aliases = ['HM'];

export default CovenRole(HexMaster);
