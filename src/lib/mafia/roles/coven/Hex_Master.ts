import CovenRole from '@mafia/mixins/CovenRole';
import { Attack } from '@mafia/managers/NightActionsManager';
import type Player from '@mafia/structures/Player';
import { ActionRole } from '../../structures/ActionRole';
import { HexAction } from '../../actions/common/HexAction';
import type { NightAction } from '../../managers/NightAction';

class HexMaster extends ActionRole {
	public name = 'Hex Master';
	public actions: NightAction[] = [new HexAction(this)];

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/coven:hexMasterDescription');
	}

	public canUseAction(command?: string) {
		if (
			this.game.nightActions.hexedPlayers.length ===
			this.game.players.filter((player) => player.isAlive && player.role.faction.name !== 'Coven').length
		)
			return { check: false, reason: this.game.t('roles/coven:hexMasterEveryoneHexed') };
		return super.canUseAction(command);
	}

	public async onNight() {
		// HMs with the Necromicon do not visit their targets
		if (this.game.necronomiconWith === this.player) {
			this.actions[0].flags!.canVisit = false;
		}

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
			await this.player.user.send(this.game.t('roles/coven:hexMasterFinalHex'));
		}

		return super.onNight();
	}
}

HexMaster.aliases = ['HM'];

export default CovenRole(HexMaster);
