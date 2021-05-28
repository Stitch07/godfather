import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';
import { Phase } from '@mafia/structures/Game';
import { ActionRole } from '../../structures/ActionRole';
import { DoubleTargetAction } from '../../actions/mixins/DoubleTargetAction';
import type { NightAction } from '../../managers/NightAction';

const INVALID_ROLES = ['Transporter', 'Reanimator', 'Veteran', 'Necromancer'];

class Reanimator extends ActionRole {
	public name = 'Reanimator';
	public actions: NightAction[] = [new ReanimateAction(this)];

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:reanimatorDescription');
	}

	public canUseAction() {
		const validTargets = this.game.players.filter((player) => this.actions[0].canUse([player]).check);
		return { check: validTargets.length > 0, reason: this.game.t('roles/global:noTargets') };
	}

	public static unique = true;
}

Reanimator.categories = [...Reanimator.categories, 'Town Support'];

export default Townie(Reanimator);

export class ReanimateAction extends DoubleTargetAction {
	public name = 'reanimate';
	public priority = NightActionPriority.Reanimate;

	public constructor(role: ActionRole) {
		super(role);
		this.actionText = this.game.t('roles/actions:reanimatorText');
		this.actionGerund = this.game.t('roles/actions:reanimatorGerund');
	}

	public async setUp(actions: NightActionsManager, [actor, target]: Player[]) {
		const thisArg = Object.assign(actor.role, { player: this.player });
		// TODO: make this work with JoATs when implemented
		await (actor.role as ActionRole).actions[0].setUp.call(thisArg, actions, target);
	}

	public async runAction(actions: NightActionsManager, [actor, target]: Player[]) {
		const thisArg = Object.assign(actor.role, { player: this.player });
		await (actor.role as ActionRole).actions[0].runAction.call(thisArg, actions, target);
	}

	public async tearDown(actions: NightActionsManager, [actor, target]: Player[]) {
		const thisArg = Object.assign(actor.role, { player: this.player });
		await (actor.role as ActionRole).actions[0].tearDown.call(thisArg, actions, target);
	}

	public canUse([player]: Player[]) {
		if (player.isAlive) return { check: false, reason: this.game.t('roles/town:reanimatorDeadOnly') };
		if (!Reflect.has(player.role, 'action') || Reflect.get(player.role, 'actionPhase') !== Phase.Night)
			return { check: false, reason: this.game.t('roles/town:reanimatorActionOnly') };
		if (player.role.faction.name !== 'Town') return { check: false, reason: this.game.t('roles/town:reanimatorDeadTownies') };
		if (INVALID_ROLES.includes(player.role.name))
			return { check: false, reason: this.game.t('roles/town:reanimatorInvalidRole', { role: player.role.name }) };
		return { check: true, reason: '' };
	}

	public confirmation([player]: Player[]) {
		return this.game.t('roles/town:reanimatorActionConfirmation', { target: player });
	}
}
