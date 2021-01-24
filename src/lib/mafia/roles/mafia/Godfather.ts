import NightActionsManager, { Defence } from '@mafia/managers/NightActionsManager';
import Killer from '@mafia/mixins/Killer';
import MafiaRole from '@mafia/mixins/MafiaRole';

class Godfather extends Killer {
	public name = 'Godfather';
	public description = 'You can order the mafioso to shoot someone every night.';

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
