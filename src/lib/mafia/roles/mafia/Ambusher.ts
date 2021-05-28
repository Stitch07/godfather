import NightActionsManager, { Attack, NightActionPriority } from '@mafia/managers/NightActionsManager';
import MafiaRole from '@mafia/mixins/MafiaRole';
import type Player from '@mafia/structures/Player';
import { randomArrayItem } from '@root/lib/util/utils';
import { SingleTargetAction } from '../../actions/mixins/SingleTargetAction';
import type { NightAction } from '../../managers/NightAction';
import { ActionRole } from '../../structures/ActionRole';

class Ambusher extends ActionRole {
	public name = 'Ambusher';
	public actions: NightAction[] = [new AmbushAction(this)];

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/mafia:ambusherDescription');
	}
}

Ambusher.categories = [...Ambusher.categories, 'Mafia Killing'];

export default MafiaRole(Ambusher);

export class AmbushAction extends SingleTargetAction {
	public name = 'ambush';
	public priority = NightActionPriority.AMBUSHER;
	private killTarget: Player | null = null;

	public constructor(role: ActionRole) {
		super(role);
		this.actionText = this.game.t('roles/actions:ambusherText');
		this.actionGerund = this.game.t('roles/actions:ambusherGerund');
	}

	public canUse(target: Player) {
		if (target.role.faction.name === 'Mafia') return { check: false, reason: this.game.t('roles/global:targetTeammates') };
		return super.canUse(target);
	}

	public runAction(actions: NightActionsManager, target: Player) {
		const visitors = target.visitors.filter((player) => player.role.faction.name !== 'Mafia');
		const killTarget = randomArrayItem(visitors);

		if (killTarget !== null) {
			this.killTarget = killTarget;
			actions.record.setAction(this.killTarget.user.id, 'nightkill', { result: true, by: [this.player], type: Attack.Unstoppable });
		}
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		if (this.killTarget !== null) {
			const record = actions.record.get(this.killTarget.user.id).get('nightkill');
			const success = record.result && record.by.some((player) => this.player.user.id === player.user.id);

			for (const visitor of target.visitors) {
				if (visitor !== this.player && visitor.user.id !== this.killTarget.user.id)
					visitor.queueMessage(this.game.t('roles/mafia:ambusherAlert', { ambusher: this.player.user.tag }));
			}
			this.player.queueMessage(this.game.t('roles/mafia:ambusherSuccess'));
			if (!success) {
				return this.player.queueMessage(this.game.t('roles/global:targetTooStrong'));
			}
			this.killTarget.queueMessage(this.game.t('roles/mafia:ambusherAttack'));
			this.killTarget = null;
		}
	}
}
