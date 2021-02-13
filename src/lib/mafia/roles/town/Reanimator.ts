import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import DoubleTarget from '@mafia/mixins/DoubleTarget';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';
import type SingleTarget from '../../mixins/SingleTarget';
import { Phase } from '@mafia/structures/Game';

const INVALID_ROLES = ['Transporter', 'Reanimator', 'Veteran'];

class Reanimator extends DoubleTarget {
	public name = 'Reanimator';
	public action = 'reanimate';
	public priority = NightActionPriority.Reanimator;

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:reanimatorDescription');
		this.actionText = this.game.t('roles/actions:reanimatorText');
		this.actionGerund = this.game.t('roles/actions:reanimatorGerund');
	}

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
		return { check: validTargets.length > 0, reason: this.game.t('roles/global:noTargets') };
	}

	public canTarget([player]: Player[]) {
		if (player.isAlive) return { check: false, reason: this.game.t('roles/town:reanimatorDeadOnly') };
		if (!Reflect.has(player.role, 'action') || Reflect.get(player.role, 'actionPhase') !== Phase.Night)
			return { check: false, reason: this.game.t('roles/town:reanimatorActionOnly') };
		if (player.role.faction.name !== 'Town') return { check: false, reason: this.game.t('roles/town:reanimatorDeadTownies') };
		if (INVALID_ROLES.includes(player.role.name))
			return { check: false, reason: this.game.t('roles/town:reanimatorInvalidRole', { role: player.role.name }) };
		return { check: true, reason: '' };
	}

	public actionConfirmation([player]: Player[]) {
		return this.game.t('roles/town:reanimatorActionConfirmation', { target: player });
	}

	public static unique = true;
}

Reanimator.categories = [...Reanimator.categories, 'Town Support'];

export default Townie(Reanimator);
