import { Attack, Defence } from '@mafia/managers/NightActionsManager';
import MafiaRole from '@mafia/mixins/MafiaRole';
import type Player from '@mafia/structures/Player';
import KillerAction from '../../actions/common/KillerAction';
import type { NightAction } from '../../managers/NightAction';
import { ActionRole } from '../../structures/ActionRole';

class Godfather extends ActionRole {
	public name = 'Godfather';
	public actions: NightAction[] = [new KillerAction(this, Attack.Basic, 'shoot')];

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/mafia:godfatherDescription');
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
