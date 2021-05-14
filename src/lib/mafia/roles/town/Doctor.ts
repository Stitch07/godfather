import Townie from '@mafia/mixins/Townie';
import NightActionsManager, { Attack, NightActionPriority } from '@mafia/managers/NightActionsManager';
import type Player from '@mafia/structures/Player';
import { SingleTargetAction } from '../../actions/mixins/SingleTargetAction';
import { ActionRole } from '../../structures/ActionRole';
import type { NightAction } from '../../managers/NightAction';

class Doctor extends ActionRole {
	public name = 'Doctor';
	public actions: NightAction[] = [new DoctorHealAction(this)];

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:doctorDescription');
	}

	public get extraNightContext() {
		return (this.actions.find((action) => action.name === 'heal') as DoctorHealAction).hasSelfHealed
			? this.game.t('roles/town:doctorCannotSelfHeal')
			: this.game.t('roles/town:doctorCanSelfHeal');
	}
}

Doctor.aliases = ['Doc'];
Doctor.categories = [...Doctor.categories, 'Town Protective'];

export class DoctorHealAction extends SingleTargetAction {
	public name = 'heal';
	public priority = NightActionPriority.DOCTOR;
	public hasSelfHealed = false;

	public constructor(role: ActionRole) {
		super(role);
		this.actionText = this.game.t('roles/actions:doctorText');
		this.actionGerund = this.game.t('roles/actions:doctorGerund');
	}

	public runAction(actions: NightActionsManager, target: Player) {
		if (target === this.role.player) this.hasSelfHealed = true;
		const playerRecord = actions.record.get(target.user.id);

		const nightKills = playerRecord.get('nightkill');
		const isClConverting = actions.find((action) => action.actor.role.name === 'Cult Leader' && action.target === target);

		if (isClConverting || (nightKills.result && nightKills.type && nightKills.type < Attack.Unstoppable)) {
			nightKills.result = false;
			nightKills.by = [];
			playerRecord.set('nightkill', { result: false, by: [] });

			const heals = playerRecord.get('heal');
			heals.result = true;
			heals.by.push(this.role.player);
			playerRecord.set('heal', heals);

			actions.record.set(target.user.id, playerRecord);
		}
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id).get('heal');
		const success = record.result && record.by.includes(this.role.player);

		if (success) {
			return target.queueMessage(this.role.game.t('rols/town:doctorHealed'));
		}
	}

	public canTarget(player: Player) {
		// TODO: customizable rule here
		if (player === this.role.player && this.hasSelfHealed) return { check: false, reason: this.role.game.t('roles/town:doctorSelfHealOnce') };
		// docs cannot heal confirmed mayors
		if (player.role.name === 'Mayor' && Reflect.get(player.role, 'hasRevealed') === true)
			return { check: false, reason: this.role.game.t('roles/town:doctorHealMayor') };
		if (!player.isAlive) return { check: false, reason: this.role.game.t('roles/global:targetDeadPlayers') };
		return { check: true, reason: '' };
	}
}

export default Townie(Doctor);
