import NightActionsManager, { Defence } from '@mafia/managers/NightActionsManager';
import Killer from '@mafia/mixins/Killer';
import MafiaRole from '@mafia/mixins/MafiaRole';
import type Player from '@mafia/structures/Player';

class Godfather extends Killer {
	public name = 'Godfather';

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/mafia:godfatherDescription');
	}

	public setUp(actions: NightActionsManager) {
		const goonKills = actions.filter((action) => action.actor.role.name === 'Goon');
		// remove actions if the goon wasn't roleblocked
		if (goonKills.length > 0) {
			actions.splice(
				actions.findIndex((action) => action.actor === this.player),
				1
			);
		}
	}

	public get defence() {
		return Defence.Basic;
	}

	// eslint-disable-next-line @typescript-eslint/class-literal-property-style
	public get innocence() {
		return true;
	}

	public static unique = true;
}

Godfather.categories = [...Godfather.categories, 'Mafia Killing'];
Godfather.aliases = ['GF'];

export default MafiaRole(Godfather);
