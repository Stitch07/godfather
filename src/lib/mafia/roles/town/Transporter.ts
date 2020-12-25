import DoubleTarget from '@root/lib/mafia/mixins/DoubleTarget';
import Townie from '@mafia/mixins/Townie';
import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import Player from '@mafia/Player';

class Transporter extends DoubleTarget {

	public name = 'Transporter';
	public description = 'You may transport 2 players each night.';
	public action = 'transport';
	public actionText = 'transport 2 players ';
	public actionGerund = 'transporting';
	public priority = NightActionPriority.TRANSPORTER;

	public setUp(actions: NightActionsManager, targets: Player[]) {
		const [targetOne, targetTwo] = targets;
		for (const action of actions) {
			if (!action.flags?.canTransport) continue;
			if (action.target && action.target === targetOne) action.target = targetTwo;
			else if (action.target && action.target === targetTwo) action.target = targetOne;
		}
	}

	public async tearDown(actions: NightActionsManager, targets: Player[]) {
		for (const target of targets) {
			await target.queueMessage('You were transported to another location.');
		}
	}

}

Transporter.categories = [...Transporter.categories, 'Town Support'];

export default Townie(Transporter);
