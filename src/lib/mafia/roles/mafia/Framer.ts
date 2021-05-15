import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import MafiaRole from '@mafia/mixins/MafiaRole';
import SingleTarget from '@mafia/mixins/SingleTarget';
import type Player from '@mafia/structures/Player';

class Framer extends SingleTarget {
	public name = 'Framer';
	public action = 'frame';
	public priority = NightActionPriority.Frame;

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/neutral:framerDescription');
		this.actionText = this.game.t('roles/actions:framerText');
		this.actionGerund = this.game.t('roles/actions:framerGerund');
	}

	public setUp(actions: NightActionsManager, target: Player) {
		actions.framedPlayers.push(target);
	}
}

Framer.categories = [...Framer.categories, 'Mafia Deception'];

export default MafiaRole(Framer);
