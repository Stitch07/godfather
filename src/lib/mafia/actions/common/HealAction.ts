import NightActionsManager, { NightActionPriority, Attack } from '../../managers/NightActionsManager';
import type { ActionRole } from '../../structures/ActionRole';
import type Player from '../../structures/Player';
import { SingleTargetAction } from '../mixins/SingleTargetAction';

enum ActionType {
	Heal,
	Guard,
	Jail
}

export class HealAction extends SingleTargetAction {
	public priority = NightActionPriority.Healer;
	public hasSelfHealed = false;

	public constructor(role: ActionRole, private type: ActionType, remainingUses = Number.POSITIVE_INFINITY) {
		super(role, remainingUses);
		this.actionText = this.game.t(`roles/actions:${this.role.name.toLowerCase()}Text`);
		this.actionGerund = this.game.t(`roles/actions:${this.role.name.toLowerCase()}Gerund`);

		switch (this.type) {
			case ActionType.Heal:
				this.name = 'heal';
				break;
			case ActionType.Guard:
				this.name = 'guard';
				break;
			case ActionType.Jail:
				this.name = 'jail';
				break;
		}
	}

	public setUp(actions: NightActionsManager, target: Player) {
		if (this.type === ActionType.Jail) {
			for (const action of actions.filter((act) => act.actor === target)) {
				if (!(action.flags?.canBlock ?? true)) continue;
				actions.splice(actions.indexOf(action), 1);
				actions.record.setAction(target.user.id, 'roleblock', { result: true, by: [this.player] });
			}
		}
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
			if (this.type === ActionType.Guard) {
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
		const roleblockRecord = actions.record.get(target.user.id).get('roleblock');
		const roleblockSuccess = roleblockRecord.result && roleblockRecord.by.includes(this.player);
		if (roleblockSuccess && this.type === ActionType.Jail)
			target.queueMessage(this.game.t(`roles/town:${this.role.name.toLowerCase()}Roleblock`));

		const record = actions.record.get(target.user.id).get('heal');
		const success = record.result && record.by.includes(this.role.player);

		if (success) {
			return target.queueMessage(this.role.game.t(`roles/town:${this.role.name.toLowerCase()}Save`));
		}
	}

	public canUse(player: Player) {
		if (player === this.role.player && this.type !== ActionType.Heal) return { check: false, reason: this.game.t('roles/global:targetSelf') };
		if (player === this.role.player && this.hasSelfHealed)
			return { check: false, reason: this.role.game.t(`roles/town:${this.role.name.toLowerCase()}SelfHealOnce`) };
		// docs cannot heal confirmed mayors
		if (this.type === ActionType.Heal && player.role.name === 'Mayor' && Reflect.get(player.role, 'hasRevealed') === true)
			return { check: false, reason: this.role.game.t(`roles/town:${this.role.name.toLowerCase()}HealMayor`) };
		if (!player.isAlive) return { check: false, reason: this.role.game.t('roles/global:targetDeadPlayers') };
		return { check: true, reason: '' };
	}
}

export class DoctorHealAction extends HealAction {
	public constructor(role: ActionRole) {
		super(role, ActionType.Heal);
	}
}

export class BodyguardHealAction extends HealAction {
	public constructor(role: ActionRole) {
		super(role, ActionType.Guard);
	}
}

export class JailkeeperHealAction extends HealAction {
	public constructor(role: ActionRole) {
		super(role, ActionType.Jail);
	}
}
