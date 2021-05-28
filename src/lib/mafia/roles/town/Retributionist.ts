import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';
import { SingleTargetAction } from '../../actions/mixins/SingleTargetAction';
import type { NightAction } from '../../managers/NightAction';
import { ActionRole } from '../../structures/ActionRole';

class Retributionist extends ActionRole {
	public name = 'Retributionist';
	public actions: NightAction[] = [new ReviveAction(this)];

	// whether the Ret has already revived a player
	public hasRevived = false;

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:retributionistDescription');
	}

	public canUseAction() {
		if (this.hasRevived) return { check: false, reason: this.game.t('roles/town:retributionistAlreadyRevived') };
		const validTargets = this.game.players.filter((target) => this.actions[0].canUse(target).check);
		if (validTargets.length === 0) return { check: false, reason: this.game.t('roles/global:noTargets') };
		return { check: true, reason: '' };
	}

	public static unique = true;
}

Retributionist.categories = [...Retributionist.categories, 'Town Support'];
Retributionist.aliases = ['Ret', 'Retri'];

export default Townie(Retributionist);

export class ReviveAction extends SingleTargetAction {
	public name = 'revive';
	public priority = NightActionPriority.RETRIBUTIONIST;
	public flags = {
		canTransport: false,
		canVisit: false,
		canWitch: false
	};

	public constructor(role: Retributionist) {
		super(role);
		this.actionText = this.game.t('roles/actions:retributionistText');
		this.actionGerund = this.game.t('roles/actions:retributionistGerund');
	}

	public async tearDown(actions: NightActionsManager, target: Player) {
		target.isAlive = true;
		target.deathReason = '';
		target.flags.isRevived = true;
		target.flags.revivedOn = this.game.cycle;
		(this.role as Retributionist).hasRevived = true;

		await this.game.channel.send(this.game.t('roles/town:retributionistAnnouncement', { player: target }));
		target.queueMessage(this.game.t('roles/town:retributionistMessage'));

		if (target.role.name === 'Vigilante') {
			Reflect.set(target.role, 'guilty', false);
		}

		if (this.game.canOverwritePermissions) {
			const overwrite = this.game.channel.permissionOverwrites.find(
				(permission) => permission.type === 'member' && permission.id === target.user.id
			);
			if (overwrite) await overwrite.update({ SEND_MESSAGES: true, ADD_REACTIONS: true });
		}
	}

	public canUse(target: Player) {
		if (target.isAlive || target.role.faction.name !== 'Town')
			return { check: false, reason: this.game.t('roles/town:retributionistDeadTownies') };
		if (target.cleaned) return { check: false, reason: this.game.t('roles/town:retributionistNoCleaned') };
		// @ts-ignore tsc cannot detect static properties
		if (target.role.constructor.unique) return { check: false, reason: this.game.t('roles/town:retributionistNoUnique') };
		return { check: true, reason: '' };
	}
}
