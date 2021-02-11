import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import SingleTarget from '@mafia/mixins/SingleTarget';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';

class Lookout extends SingleTarget {
	public name = 'Lookout';
	public action = 'watch';
	public actionText = 'watch a player';
	public actionGerund = 'watching';
	public priority = NightActionPriority.LOOKOUT;

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:lookoutDescription');
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const visitors = target.visitors.filter((visitor) => visitor !== this.player);
		if (visitors.length > 0)
			return this.player.queueMessage(
				this.game.t('roles/town:lookoutVisitedBy', { players: visitors.map((visitor) => visitor.user.username) })
			);
		return this.player.queueMessage(this.game.t('roles/town:lookoutNoVisits'));
	}
}

Lookout.aliases = ['LO'];
Lookout.categories = [...Lookout.categories, 'Town Investigative'];

export default Townie(Lookout);
