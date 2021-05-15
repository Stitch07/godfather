import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';
import { AlignmentCheckAction } from '../../actions/common/CheckAction';
import type { NightAction } from '../../managers/NightAction';
import { ActionRole } from '../../structures/ActionRole';

class Cop extends ActionRole {
	public name = 'Cop';
	public actions: NightAction[] = [new AlignmentCheckAction(this)];

	public constructor(player: Player) {
		super(player);

		this.description = this.game.t('roles/town:copDescription');
	}

	// ensures that Dethy cops don't get PMed their real role
	public get display(): string {
		if (this.player.cleaned && !this.player.isAlive) return 'Cleaned';
		return 'Cop';
	}
}

Cop.categories = [...Cop.categories, 'Town Investigative'];

export default Townie(Cop);
