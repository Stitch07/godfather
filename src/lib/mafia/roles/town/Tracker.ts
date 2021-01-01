import SingleTarget from '#mafia/mixins/SingleTarget';
import Townie from '#mafia/mixins/Townie';
import NightActionsManager, { NightActionPriority } from '#mafia/managers/NightActionsManager';
import Player from '#mafia/structures/Player';
import { listItems } from '#util/utils';

class Tracker extends SingleTarget {

	public name = 'Tracker';
	public description = 'You may track one person at night to find out who they visited.';
	public action = 'track';
	public actionText = 'track a player';
	public actionGerund = 'tracking';
	public priority = NightActionPriority.TRACKER;

	public tearDown(actions: NightActionsManager, target: Player) {
		const visited = this.game.players.filter(player => player.visitors.includes(target));
		if (visited.length > 0) {
			return this.player.queueMessage(`Your target visited ${listItems(visited.map(player => player.user.username))}`);
		}
	}

}

Tracker.categories = [...Tracker.categories, 'Town Investigative'];

export default Townie(Tracker);
