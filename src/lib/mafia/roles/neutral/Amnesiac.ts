import AmnesiacFaction from '@mafia/factions/neutral/Amnesiac';
import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import SingleTarget from '@mafia/mixins/SingleTarget';
import { allRoles } from '@mafia/roles';
import Player from '@mafia/structures/Player';
import { cast } from '@root/lib/util/utils';
import type Juggernaut from './Juggernaut';

export default class Amnesiac extends SingleTarget {
	public name = 'Amnesiac';
	public faction = new AmnesiacFaction();
	public action = 'remember';
	public priority = NightActionPriority.AMNESIAC;

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/neutral:amnesiacDescription');
		this.actionText = this.game.t('roles/actions:amnesiacText');
		this.actionGerund = this.game.t('roles/actions:amnesiacGerund');
	}

	public setUp(actions: NightActionsManager) {
		// if 2 amnesiacs remember a unique role at the same time, the first person to send actions actually remembers
		const otherAmne = actions.filter(
			(action) =>
				action.actor.user.id !== this.player.user.id &&
				action.actor.role.name === 'Amnesiac' &&
				action.target instanceof Player &&
				// @ts-ignore static prop
				action.target!.role.constructor.unique
		);
		for (const action of otherAmne) {
			actions.splice(actions.indexOf(action), 1);
		}
	}

	public async tearDown(actions: NightActionsManager, target: Player) {
		const newRole = allRoles.get(target.role.name)!;
		if (newRole.name === 'Juggernaut') {
			const { level } = cast<Juggernaut>(target.role);
			this.player.role = new newRole(this.player, { level });
		} else {
			this.player.role = new newRole(this.player);
		}
		await this.player.user.send(this.game.t('roles/neutral:amnesiacMessage', { role: this.player.role.name }));
		await this.player.sendPM();
		await this.game.channel.send(this.game.t('roles/neutral:amnesiacAnnouncement', { role: this.player.role.name }));
		await this.player.role.init();
	}

	public canUseAction() {
		const validTargets = this.game.players.filter((player) => this.canTarget(player).check);
		if (validTargets.length === 0) return { check: false, reason: this.game.t('roles/global:noTargets') };
		return { check: true, reason: '' };
	}

	public canTarget(target: Player) {
		if (target.isAlive) return { check: false, reason: this.game.t('roles/neutral:amnesiacDeadOnly') };
		if (target.cleaned) return { check: false, reason: this.game.t('roles/neutral:amnesiacNoCleaned') };
		// @ts-ignore tsc cannot detect static properties
		if (target.role.constructor.unique && target.role.faction.name === 'Town')
			return { check: false, reason: this.game.t('roles/neutral:amnesiacNoUniqueTown') };
		return { check: true, reason: '' };
	}
}

Amnesiac.aliases = ['Amne'];
Amnesiac.categories = [...Amnesiac.categories, 'Neutral Benign'];
