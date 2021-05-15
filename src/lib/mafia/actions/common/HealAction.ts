import NightActionsManager, { NightActionPriority, Attack } from '../../managers/NightActionsManager';
import type { ActionRole } from '../../structures/ActionRole';
import type Player from '../../structures/Player';
import { SingleTargetAction } from '../mixins/SingleTargetAction';

export class HealAction extends SingleTargetAction {
	public priority = NightActionPriority.Healer;
	public hasSelfHealed = false;
	private isGuarding: boolean;

	public constructor(role: ActionRole, guard: boolean, numRemainingUses = Number.POSITIVE_INFINITY) {
		super(role, numRemainingUses);
		this.actionText = this.game.t(`roles/actions:${this.role.name.toLowerCase()}Text`);
		this.actionGerund = this.game.t(`roles/actions:${this.role.name.toLowerCase()}Gerund`);
		this.isGuarding = guard;
		this.name = guard ? 'guard' : 'heal';
	}

	public runAction(actions: NightActionsManager, target: Player) {
		if (target === this.role.player) this.hasSelfHealed = true;
		const playerRecord = actions.record.get(target.user.id);

		const nightKills = playerRecord.get('nightkill');
		const isClConverting = actions.find((action) => action.actor.role.name === 'Cult Leader' && action.target === target);

		if (isClConverting || (nightKills.result && nightKills.type && nightKills.type < Attack.Unstoppable)) {
			playerRecord.set('nightkill', { result: false, by: [] });

			const heals = playerRecord.get('heal');
			heals.result = true;
			heals.by.push(this.role.player);
			playerRecord.set('heal', heals);

			actions.record.set(target.user.id, playerRecord);
			if (this.isGuarding) {
				const attacker = nightKills.by.pop()!;
				// kill the BG
				actions.record.setAction(this.player.user.id, 'nightkill', { result: true, by: [] });
				this.player.queueMessage(this.game.t(`roles/town:${this.role.name.toLowerCase()}DiedDefending`));
				// kill the attacker
				actions.record.setAction(attacker.user.id, 'nightkill', { result: true, by: [this.player] });
				attacker.queueMessage(this.game.t(`roles/town:${this.role.name.toLowerCase()}AttackerKilled`));
			}
		}
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id).get('heal');
		const success = record.result && record.by.includes(this.role.player);

		if (success) {
			return target.queueMessage(this.role.game.t(`roles/town:${this.role.name.toLowerCase()}Save`));
		}
	}

	public canTarget(player: Player) {
		if (player === this.role.player && this.isGuarding) return { check: false, reason: this.game.t('roles/global:targetSelf') };
		if (player === this.role.player && this.hasSelfHealed)
			return { check: false, reason: this.role.game.t(`roles/town:${this.role.name.toLowerCase()}SelfHealOnce`) };
		// docs cannot heal confirmed mayors
		if (!this.isGuarding && player.role.name === 'Mayor' && Reflect.get(player.role, 'hasRevealed') === true)
			return { check: false, reason: this.role.game.t(`roles/town:${this.role.name.toLowerCase()}HealMayor`) };
		if (!player.isAlive) return { check: false, reason: this.role.game.t('roles/global:targetDeadPlayers') };
		return { check: true, reason: '' };
	}
}

export class DoctorHealAction extends HealAction {
	public constructor(role: ActionRole) {
		super(role, false);
	}
}

export class BodyguardHealAction extends HealAction {
	public constructor(role: ActionRole) {
		super(role, true);
	}
}
