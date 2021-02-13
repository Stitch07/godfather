import WitchFaction from '@mafia/factions/neutral/Witch';
import NightActionsManager, { Defence, NightActionPriority } from '@mafia/managers/NightActionsManager';
import DoubleTarget from '@mafia/mixins/DoubleTarget';
import type Player from '@mafia/structures/Player';

class Witch extends DoubleTarget {
	public name = 'Witch';
	public action = 'witch';
	public priority = NightActionPriority.Witch;

	public faction = new WitchFaction();

	// whether the witch has been attacked already
	public attacked = false;
	private witched = false;

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/neutral:witchDescription');
		this.actionText = this.game.t('roles/actions:witchText');
		this.actionGerund = this.game.t('roles/actions:witchGerund');
	}

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
			target.queueMessage(this.game.t('roles/neutral:witchAlert'));
			this.player.queueMessage(this.game.t('roles/neutral:witchMessage', { role: target.role.name }));
		}
	}

	public canTarget(target: Player[]) {
		if (target.some((player) => !player.isAlive)) return { check: false, reason: this.game.t('roles/global:targetDeadPlayers') };
		return { check: true, reason: '' };
	}

	public actionConfirmation([player1, player2]: Player[]) {
		return this.game.t('roles/neutral:witchActionConfirmation', { player1, player2 });
	}
}

Witch.categories = [...Witch.categories, 'Neutral Evil', 'Evil'];

export default Witch;
