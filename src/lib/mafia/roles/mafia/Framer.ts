import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import MafiaRole from '@mafia/mixins/MafiaRole';
import SingleTarget from '@mafia/mixins/SingleTarget';
import type Player from '@mafia/structures/Player';

class Framer extends SingleTarget {
	public name = 'Framer';

	public description = 'You may frame a player every night, making them appear suspicious to others.';

	public action = 'frame';
	public actionGerund = 'framing';
	public actionText = 'frame a player';

	public priority = NightActionPriority.FRAMER;

	public setUp(actions: NightActionsManager, target: Player) {
		actions.framedPlayers.push(target);
	}
}

Framer.categories = [...Framer.categories, 'Mafia Deception'];

export default MafiaRole(Framer);
