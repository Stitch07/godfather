import NightActionsManager, { Attack } from '@mafia/managers/NightActionsManager';
import SingleTarget from '@mafia/mixins/SingleTarget';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';

class Jailkeeper extends SingleTarget {
	public name = 'Jailkeeper';
	public action = 'jail';
	public actionText = 'jail a player';
	public actionGerund = 'jailing';
	public priority = 0; // Action relies on setUp and tearDown only, so the priority we assign doesn't matter.

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
			actions.record.setAction(target.user.id, 'jail', { result: true, by: [this.player] });
		}
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const roleblockRecord = actions.record.get(target.user.id).get('jail');
		const roleblockSuccess = roleblockRecord.result && roleblockRecord.by.includes(this.player);
		if (roleblockSuccess) target.queueMessage(this.game.t('roles/town:jailkeeperRoleblockSuccess'));

		const playerRecord = actions.record.get(target.user.id);
		const nightKills = playerRecord.get('nightkill');
		const isClConverting = actions.find((action) => action.actor.role.name === 'Cult Leader' && action.target === target);

		if (isClConverting || (nightKills.result && nightKills.type && nightKills.type < Attack.Unstoppable)) {
			nightKills.result = false;
			nightKills.by = [];
			playerRecord.set('nightkill', { result: false, by: [] });

			const heals = playerRecord.get('jail');
			heals.result = true;
			heals.by.push(this.player);
			playerRecord.set('jail', heals);

			actions.record.set(target.user.id, playerRecord);
			target.queueMessage(this.game.t('roles/town:jailkeeperProtectSuccess'));
		}
	}
}

export default Townie(Jailkeeper);
