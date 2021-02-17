import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import MafiaRole from '@mafia/mixins/MafiaRole';
import SingleTarget from '@mafia/mixins/SingleTarget';
import type Player from '@mafia/structures/Player';

class Janitor extends SingleTarget {
	public name = 'Janitor';
	public action = 'clean';
	public priority = NightActionPriority.JANITOR;

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/neutral:janitorDescription');
		this.actionText = this.game.t('roles/actions:janitorText');
		this.actionGerund = this.game.t('roles/actions:janitorGerund');
	}

	public runAction(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id).get('nightkill');
		if (record.result) target.cleaned = true;
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id).get('nightkill');
		if (record.result && target.cleaned) {
			return this.player.queueMessage(this.game.t('roles/mafia:janitorResult', { role: target.role.name }));
		}
	}
}

Janitor.categories = [...Janitor.categories, 'Mafia Deception'];

export default MafiaRole(Janitor);
