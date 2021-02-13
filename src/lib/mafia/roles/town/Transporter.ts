import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import DoubleTarget from '@mafia/mixins/DoubleTarget';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';

class Transporter extends DoubleTarget {
	public name = 'Transporter';
	public action = 'transport';
	public priority = NightActionPriority.TRANSPORTER;

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:transporterDescription');
		this.actionText = this.game.t('roles/actions:transporterText');
		this.actionGerund = this.game.t('roles/actions:transporterGerund');
	}

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
			await target.queueMessage(this.game.t('roles/town:transporterMessage'));
		}
	}
}

Transporter.categories = [...Transporter.categories, 'Town Support'];

export default Townie(Transporter);
