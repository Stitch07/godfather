import MafiaRole from '@mafia/mixins/MafiaRole';
import SingleTarget from '@mafia/mixins/SingleTarget';
import type Player from '@mafia/structures/Player';
import { FrameAction } from '../../actions/common/FrameAction';
import type { NightAction } from '../../managers/NightAction';

class Framer extends SingleTarget {
	public name = 'Framer';
	public actions: NightAction[] = [new FrameAction(this)];

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/neutral:framerDescription');
	}
}

Framer.categories = [...Framer.categories, 'Mafia Deception'];

export default MafiaRole(Framer);
