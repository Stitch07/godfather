import SingleTarget from '@root/lib/mafia/mixins/SingleTarget';
import Townie from '@mafia/mixins/Townie';
import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import Player from '@mafia/Player';
import { listItems } from '@util/utils';

class Lookout extends SingleTarget {

	public name = 'Lookout';
	public description = 'You may watch a person at night and see who visits them.';
	public action = 'watch';
	public actionText = 'watch a player';
	public actionGerund = 'watching';
	public priority = NightActionPriority.LOOKOUT;

	public tearDown(actions: NightActionsManager, target: Player) {
		const visitors = target.visitors.filter(visitor => visitor !== this.player);
		if (visitors.length > 0) return this.player.user.send(`Your target was visited by: ${listItems(visitors.map(visitor => visitor.user.username))}`);
		return this.player.user.send('Nobody visited your target.');
	}

}

Lookout.aliases = ['LO'];
Lookout.categories = [...Lookout.categories, 'Town Investigative'];

export default Townie(Lookout);
