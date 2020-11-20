import DoubleTarget from '@root/lib/mafia/mixins/DoubleTarget';
import Townie from '@mafia/mixins/Townie';
import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import Player from '@mafia/Player';
import { Phase } from '../../Game';
import SingleTarget from '../../mixins/SingleTarget';

const INVALID_ROLES = ['Transporter', 'Mimicer'];

class Mimicer extends DoubleTarget {

	public name = 'Mimicer';
	public description = 'You may mimic a player at night, using their action';
	public action = 'mimic';
	public actionText = 'mimic a player';
	public actionGerund = 'mimicing';
	public actionParticiple = 'shot';
	public priority = NightActionPriority.Mimicer;

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
		const validTargets = this.game.players.filter(player => this.canTarget([player]));
		return { check: validTargets.length > 0, reason: 'You have no valid targets.' };
	}

	public canTarget([player]: Player[]) {
		if (player.isAlive) return { check: false, reason: 'You can only mimic dead players.' };
		if (!Reflect.has(player.role, 'action') || Reflect.get(player.role, 'actionPhase') !== Phase.Night) return { check: false, reason: 'You can only mimic players with night-actions.' };
		if (player.role.faction.name !== 'Town') return { check: false, reason: 'You can only mimic dead townies.' };
		if (INVALID_ROLES.includes(player.role.name)) return { check: false, reason: `You cannot mimic a ${player.role.name}.` };
		return { check: true, reason: '' };
	}

}

Mimicer.categories = [...Mimicer.categories, 'Town Support'];

export default Townie(Mimicer);
