import NightActionsManager, { Attack, NightActionPriority } from '@mafia/managers/NightActionsManager';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';
import { randomArrayItem } from '@root/lib/util/utils';
import { SingleTargetAction } from '../../actions/mixins/SingleTargetAction';
import { ActionRole } from '../../structures/ActionRole';

class Crusader extends ActionRole {
	public name = 'Crusader';

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:crusaderDescription');
	}
}

Crusader.aliases = ['Crus'];
Crusader.categories = [...Crusader.categories, 'Town Protective'];

export default Townie(Crusader);

export class CrusaderProtectAction extends SingleTargetAction {
	public name = 'protect';
	public actionText = 'protect a player';
	public actionGerund = 'protecting';
	public priority = NightActionPriority.CRUSADER;
	private isTargetAttacked = false;
	public constructor(role: ActionRole) {
		super(role);
		this.actionText = this.game.t('roles/actions:crusaderText');
		this.actionGerund = this.game.t('roles/actions:crusaderGerund');
	}

	public runAction(actions: NightActionsManager, target: Player) {
		const playerRecord = actions.record.get(target.user.id);
		if (playerRecord.size === 0) {
			return;
		}

		// Select visitor to be killed.
		const visitors = target.visitors.filter((player) => player.user.id !== this.player.user.id);
		const playerToKill = randomArrayItem(visitors)!;

		// Block all nightkills.
		const nightKills = playerRecord.get('nightkill');
		if (nightKills && nightKills.result && nightKills.type && nightKills.type < Attack.Unstoppable) {
			this.isTargetAttacked = true;
			playerRecord.set('nightkill', { result: false, by: [] });
		}

		const protects = playerRecord.get('protect');
		protects.result = true;
		protects.by.push(this.player);
		playerRecord.set('protect', protects);
		actions.record.set(target.user.id, playerRecord);

		// Kill the visitor.
		// crus only protects against CL, but doesn't attack them
		if (playerToKill.role.name === 'Cult Leader') return;
		actions.record.setAction(playerToKill.user.id, 'nightkill', { result: true, by: [this.player], type: Attack.Basic });
		playerToKill.queueMessage(this.game.t('roles/town:crusaderAttackedBy'));
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id).get('guard');
		const success = target.user.id !== this.player.user.id && record.result && record.by.includes(this.player);

		if (success && this.isTargetAttacked) {
			this.isTargetAttacked = false;
			return target.queueMessage('roles/town:crusaderFoughtOff');
		}
	}

	public canUse(player: Player) {
		// TODO: customizable rule here
		if (player === this.player) return { check: false, reason: this.game.t('roles/global:targetSelf') };
		return super.canUse(player);
	}
}
