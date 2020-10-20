import ActionRole from '@mafia/mixins/ActionRole';
import NightActionsManager, { NightActionCommand, NightActionPriority } from '@mafia/managers/NightActionsManager';
import Player from '@mafia/Player';
import Townie from '../../mixins/Townie';

class Cop extends ActionRole {

	public name = 'Cop';

	public action = NightActionCommand.Check;
	public actionGerund = 'checking';
	public actionText = 'check a player';
	public flags = {
		canBlock: true,
		canTransport: true,
		canVisit: true
	};

	public priority = NightActionPriority.COP;

	public async tearDown(actions: NightActionsManager, target: Player) {
		if (target.framed === false) {
			const innocence = this.innocenceModifier(target.role.innocence);
			await this.player.user.send(
				innocence ? 'Your target is innocent.' : 'Your target is suspicious.'
			);
		} else {
			await this.player.user.send('Your target is suspicious.');
			target.framed = false;
		}
	}

	public innocenceModifier(innocence: boolean) {
		// dethy cops can use this
		return innocence;
	}

	public static documentation = 'Roleinfo docs here.';

}

export default Townie(Cop);
