import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import SingleTarget from '@mafia/mixins/SingleTarget';
import MafiaRole from '@mafia/mixins/MafiaRole';
import Player from '@mafia/structures/Player';

class Janitor extends SingleTarget {

	public name = 'Janitor';
	public description = 'You may clean a player at night.';
	public action = 'clean';
	public actionText = 'clean a player';
	public actionGerund = 'cleaning';
	public priority = NightActionPriority.JANITOR;

	public runAction(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id).get('nightkill');
		if (record.result) target.cleaned = true;
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id).get('nightkill');
		if (record.result && target.cleaned) {
			return this.player.queueMessage(`You secretly know that your target's role was ${target.role.name}`);
		}
	}

}

Janitor.categories = [...Janitor.categories, 'Mafia Deception'];

export default MafiaRole(Janitor);
