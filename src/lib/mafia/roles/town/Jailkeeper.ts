import NightActionsManager, { Attack, NightActionPriority } from '@mafia/managers/NightActionsManager';
import SingleTarget from '@mafia/mixins/SingleTarget';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';

class Jailkeeper extends SingleTarget {
	public name = 'Jailkeeper';
	public action = 'jail';
	public actionText = 'jail a player';
	public actionGerund = 'jailing';
	public priority = NightActionPriority.JAILKEEPER;

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:jailkeeperDescription');
		this.actionText = this.game.t('roles/actions:jailkeeperText');
		this.actionGerund = this.game.t('roles/actions:jailkeeperGerund');
	}

	public setUp(actions: NightActionsManager, target: Player) {
		for (const action of actions.filter((act) => act.actor === target)) {
			if (!(action.flags?.canBlock ?? true)) continue;
			actions.splice(actions.indexOf(action), 1);
			actions.record.setAction(target.user.id, 'jailRoleblock', { result: true, by: [this.player] });
		}
	}

	public runAction(actions: NightActionsManager, target: Player) {
		const playerRecord = actions.record.get(target.user.id);
		const nightKills = playerRecord.get('nightkill');
		const isClConverting = actions.find((action) => action.actor.role.name === 'Cult Leader' && action.target === target);

		if (isClConverting || (nightKills.result && nightKills.type && nightKills.type < Attack.Unstoppable)) {
			nightKills.result = false;
			nightKills.by = [];
			playerRecord.set('nightkill', { result: false, by: [] });

			const protections = playerRecord.get('jailProtect');
			protections.result = true;
			protections.by.push(this.player);
			playerRecord.set('jailProtect', protections);

			actions.record.set(target.user.id, playerRecord);
		}
	}

	public canTarget(player: Player) {
		if (player === this.player) return { check: false, reason: this.game.t('roles/town:jailkeeperSelfTarget') };
		if (!player.isAlive) return { check: false, reason: this.game.t('roles/global:targetDeadPlayers') };
		return { check: true, reason: '' };
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const roleblockRecord = actions.record.get(target.user.id).get('jailRoleblock');
		const roleblockSuccess = roleblockRecord.result && roleblockRecord.by.includes(this.player);
		if (roleblockSuccess) target.queueMessage(this.game.t('roles/town:jailkeeperRoleblockSuccess'));

		const protectRecord = actions.record.get(target.user.id).get('jailProtect');
		const protectSuccess = protectRecord.result && protectRecord.by.includes(this.player);
		if (protectSuccess) target.queueMessage(this.game.t('roles/town:jailkeeperProtectSuccess'));
	}
}

export default Townie(Jailkeeper);
