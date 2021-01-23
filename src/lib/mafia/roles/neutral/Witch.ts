import WitchFaction from '@mafia/factions/neutral/Witch';
import NightActionsManager, { Defence, NightActionPriority } from '@mafia/managers/NightActionsManager';
import DoubleTarget from '@mafia/mixins/DoubleTarget';
import type Player from '@mafia/structures/Player';

class Witch extends DoubleTarget {
	public name = 'Witch';
	public description = 'You may witch one player onto another at night.';
	public action = 'witch';
	public actionText = 'witch one player onto another';
	public actionGerund = 'controlling';
	public priority = NightActionPriority.Witch;

	public faction = new WitchFaction();

	// whether the witch has been attacked already
	public attacked = false;
	private witched = false;

	public get defence() {
		return this.attacked ? Defence.None : Defence.Basic;
	}

	public setUp(actions: NightActionsManager, targets: Player[]) {
		const [targetOne, targetTwo] = targets;
		for (const action of actions) {
			if (!(action.flags?.canWitch ?? true)) continue;
			if (action.actor === targetOne) {
				if (action.target && !Array.isArray(action.target)) action.target = targetTwo;
				this.witched = true;
			}
		}
	}

	public tearDown(actions: NightActionsManager, [target]: Player[]) {
		if (this.witched) {
			target.queueMessage('You felt a mystical presence dominating you. You were controlled by a witch!');
			this.player.queueMessage(`You secretly know that your target is a ${target.role.name}.`);
		}
	}

	public canTarget(target: Player[]) {
		if (target.some((player) => !player.isAlive)) return { check: false, reason: 'You cannot target dead players.' };
		return { check: true, reason: '' };
	}

	public actionConfirmation([player1, player2]: Player[]) {
		return `You are controlling ${player1} onto ${player2} tonight.`;
	}
}

Witch.categories = [...Witch.categories, 'Neutral Evil', 'Evil'];

export default Witch;
