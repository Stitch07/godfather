import SingleTarget from '@mafia/mixins/SingleTarget';
import CovenRole from '@mafia/mixins/CovenRole';
import NightActionsManager, { Attack, NightActionPriority } from '@mafia/managers/NightActionsManager';
import type Player from '@mafia/structures/Player';

class HexMaster extends SingleTarget {
	public name = 'Hex Master';
	public action = 'hex';
	public priority = NightActionPriority.KILLER;

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/coven:hexMasterDescription');
		this.actionText = this.game.t('roles/actions:hexMasterText');
		this.actionGerund = this.game.t('roles/actions:hexMasterGerund');
	}

	public onNight() {
		// eslint-disable-next-line prettier/prettier
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

	public canUseAction() {
		if (
			this.game.nightActions.hexedPlayers.length ===
			this.game.players.filter((player) => player.isAlive && player.role.faction.name !== 'Coven').length
		)
			return { check: false, reason: this.game.t('roles/coven:hexMasterEveryoneHexed') };
		return super.canUseAction();
	}

	public runAction(actions: NightActionsManager, target: Player) {
		actions.hexedPlayers.push(target);
	}
}

HexMaster.aliases = ['HM'];

export default CovenRole(HexMaster);
