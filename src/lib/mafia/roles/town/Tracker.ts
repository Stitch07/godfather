import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';
import { TrackAction } from '../../actions/common/TrackAction';
import type { NightAction } from '../../managers/NightAction';
import { ActionRole } from '../../structures/ActionRole';

class Tracker extends ActionRole {
	public name = 'Tracker';
	public actions: NightAction[] = [new TrackAction(this)];

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:trackerDescription');
	}
}

Tracker.categories = [...Tracker.categories, 'Town Investigative'];

export default Townie(Tracker);
