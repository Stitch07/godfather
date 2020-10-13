import ActionRole from '@mafia/mixins/ActionRole';
import NightActionsManager, { NightActionCommand } from '@mafia/managers/NightActionsManager';
import Player from '@mafia/Player';
import Townie from '../../mixins/Townie';

class Cop extends ActionRole {

	public name = 'Cop';

	public action = NightActionCommand.Check;
	public actionGerund = 'checking';
	public actionText = 'check a player.';
	public flags = {
		canBlock: true,
		canTransport: true,
		canVisit: true
	};

	public async tearDown(actions: NightActionsManager, target: Player) {
		const innocence = this.innocenceModifier(target.role.innocence);
		await this.player.user.send(
			innocence ? 'Your target is innocent.' : 'Your target is suspicious.'
		);
	}

	public innocenceModifier(innocence: boolean) {
		// dethy cops can use this
		return innocence;
	}

	public static documentation = 'Roleinfo docs here.';

}

export default Townie(Cop);
