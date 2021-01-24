import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import SingleTarget from '@mafia/mixins/SingleTarget';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';

class Escort extends SingleTarget {
	public name = 'Escort';
	public description = 'You may roleblock somebody each night.';
	public action = 'block';
	public actionText = 'block a player';
	public actionGerund = 'blocking';
	public priority = NightActionPriority.ESCORT;

	public setUp(actions: NightActionsManager, target: Player) {
		for (const action of actions.filter((act) => act.actor === target)) {
			if (!(action.flags?.canBlock ?? true)) continue;
			// escorts blocking SKs get stabbed instead
			if (action.actor.role.name === 'Serial Killer') {
				action.target = this.player;
				continue;
			}
			actions.splice(actions.indexOf(action), 1);
			actions.record.setAction(target.user.id, 'roleblock', { result: true, by: [this.player] });
		}
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id).get('roleblock');
		const success = record.result && record.by.includes(this.player);
		if (success) return target.queueMessage('Somebody occupied your night. You were roleblocked!');
	}
}

Escort.categories = [...Escort.categories, 'Town Support'];

export default Townie(Escort);
