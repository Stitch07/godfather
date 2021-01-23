import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import DoubleTarget from '@mafia/mixins/DoubleTarget';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';
import type SingleTarget from '../../mixins/SingleTarget';
import { Phase } from '../../structures/Game';

const INVALID_ROLES = ['Transporter', 'Reanimator', 'Veteran'];

class Reanimator extends DoubleTarget {
	public name = 'Reanimator';
	public description = 'You may reanimate a dead Townie at night, using their action';
	public action = 'reanimate';
	public actionText = 'reanimate a player';
	public actionGerund = 'reanimating';
	public priority = NightActionPriority.Reanimator;

	public async setUp(actions: NightActionsManager, [actor, target]: Player[]) {
		const thisArg = Object.assign(actor.role, { player: this.player });
		await (actor.role as SingleTarget).setUp.call(thisArg, actions, target);
	}

	public async runAction(actions: NightActionsManager, [actor, target]: Player[]) {
		const thisArg = Object.assign(actor.role, { player: this.player });
		await (actor.role as SingleTarget).runAction.call(thisArg, actions, target);
	}

	public async tearDown(actions: NightActionsManager, [actor, target]: Player[]) {
		const thisArg = Object.assign(actor.role, { player: this.player });
		await (actor.role as SingleTarget).tearDown.call(thisArg, actions, target);
	}

	public canUseAction() {
		const validTargets = this.game.players.filter((player) => this.canTarget([player]).check);
		return { check: validTargets.length > 0, reason: 'You have no valid targets.' };
	}

	public canTarget([player]: Player[]) {
		if (player.isAlive) return { check: false, reason: 'You can only reanimate dead players.' };
		if (!Reflect.has(player.role, 'action') || Reflect.get(player.role, 'actionPhase') !== Phase.Night)
			return { check: false, reason: 'You can only mimic players with night-actions.' };
		if (player.role.faction.name !== 'Town') return { check: false, reason: 'You can only reanimate dead townies.' };
		if (INVALID_ROLES.includes(player.role.name)) return { check: false, reason: `You cannot reanimate a ${player.role.name}.` };
		return { check: true, reason: '' };
	}

	public actionConfirmation([player]: Player[]) {
		return `You are reanimating ${player} tonight.`;
	}

	public static unique = true;
}

Reanimator.categories = [...Reanimator.categories, 'Town Support'];

export default Townie(Reanimator);
