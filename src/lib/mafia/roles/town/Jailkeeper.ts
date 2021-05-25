import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';
import { JailkeeperHealAction } from '../../actions/common/HealAction';
import type { NightAction } from '../../managers/NightAction';
import { ActionRole } from '../../structures/ActionRole';

class Jailkeeper extends ActionRole {
	public name = 'Jailkeeper';
	public actions: NightAction[] = [new JailkeeperHealAction(this)];

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:jailkeeperDescription');
	}
}

export default Townie(Jailkeeper);
