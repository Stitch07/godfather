import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import ActionRole from '@mafia/mixins/ActionRole';
import MafiaRole from '@mafia/mixins/MafiaRole';
import Player from '@mafia/Player';

class Framer extends ActionRole {

	public name = 'Framer';

	public description = 'You may frame a player every night, making them appear suspicious to others.';

	public action = 'frame';
	public actionGerund = 'framing';
	public actionText = 'frame a player';
	public flags = {
		canBlock: true,
		canTransport: true,
		canVisit: true
	};

	public priority = NightActionPriority.FRAMER;

	public setUp(actions: NightActionsManager, target: Player) {
		actions.framedPlayers.push(target);
	}
}

export default MafiaRole(Framer);
