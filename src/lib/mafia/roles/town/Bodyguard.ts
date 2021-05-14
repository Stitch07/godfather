import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';
import { BodyguardHealAction } from '../../actions/common/HealAction';
import { VestAction } from '../../actions/common/VestAction';
import type { NightAction } from '../../managers/NightAction';
import { ActionRole } from '../../structures/ActionRole';

class Bodyguard extends ActionRole {
	public name = 'Bodyguard';
	public actions: NightAction[] = [new BodyguardHealAction(this), new VestAction(this)];

	public constructor(player: Player) {
		super(player);

		this.description = this.game.t('roles/town:bodyguardDescription');
	}
}

Bodyguard.aliases = ['BG'];
Bodyguard.categories = [...Bodyguard.categories, 'Town Protective'];

export default Townie(Bodyguard);
