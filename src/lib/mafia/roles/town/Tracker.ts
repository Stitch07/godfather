import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import SingleTarget from '@mafia/mixins/SingleTarget';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';

class Tracker extends SingleTarget {
	public name = 'Tracker';
	public action = 'track';
	public actionText = 'track a player';
	public actionGerund = 'tracking';
	public priority = NightActionPriority.TRACKER;

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:trackerDescription');
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const visited = this.game.players.filter((player) => player.visitors.includes(target));
		if (visited.length > 0) {
			return this.player.queueMessage(this.game.t('roles/town:trackerResult', { players: visited }));
		}
	}
}

Tracker.categories = [...Tracker.categories, 'Town Investigative'];

export default Townie(Tracker);
