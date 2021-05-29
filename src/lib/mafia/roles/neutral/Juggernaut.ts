import JuggernautFaction from '@mafia/factions/neutral/Juggernaut';
import { Attack, Defence } from '@mafia/managers/NightActionsManager';
import type Player from '@mafia/structures/Player';
import KillerAction from '../../actions/common/KillerAction';
import type { NightAction } from '../../managers/NightAction';
import { ActionRole } from '../../structures/ActionRole';

class Juggernaut extends ActionRole {
	public name = 'Juggernaut';
	public faction = new JuggernautFaction();
	public actions: NightAction[] = [new KillerAction(this, Attack.Powerful, 'assault')];

	// level 1 lets them attack every night, level 2 lets them rampage, ands level 3 gives them a unstoppable attack
	public level = 0;

	public constructor(player: Player, { level }: { level?: number } = { level: 0 }) {
		super(player);
		this.level = level ?? 0;
	}

	public get defence() {
		return Defence.Basic;
	}

	public static unique = true;
}

Juggernaut.aliases = ['Jugg'];
Juggernaut.categories = [...Juggernaut.categories, 'Random Neutral', 'Neutral Killing', 'Evil'];

export default Juggernaut;
