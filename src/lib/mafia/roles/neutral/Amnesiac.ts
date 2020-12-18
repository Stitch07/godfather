import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import SingleTarget from '@mafia/mixins/SingleTarget';
import AmnesiacFaction from '@mafia/factions/neutral/Amnesiac';
import Player from '@mafia/Player';
import { allRoles } from '@mafia/roles';
import Juggernaut from './Juggernaut';
import { cast } from '@root/lib/util/utils';

export default class Amnesiac extends SingleTarget {

	public name = 'Amnesiac';
	public description = 'You may remember who you were by selecting a dead player.';
	public faction = new AmnesiacFaction();
	public action = 'remember';
	public actionGerund = 'remembering as';
	public actionText = 'remember your role';
	public priority = NightActionPriority.AMNESIAC;

	public setUp(actions: NightActionsManager) {
		// if 2 amnesiacs remember a unique role at the same time, the first person to send actions actually remembers
		// @ts-ignore static props
		const otherAmne = actions.filter(action => action.actor.user.id !== this.player.user.id && action.actor.role.name === 'Amnesiac' && action.target instanceof Player && action.target!.role.constructor.unique);
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
		await this.player.user.send(`You have remembered that you were a ${this.player.role.name}!`);
		await this.player.sendPM();
		await this.game.channel.send(`An Amnesiac has remembered that they were a **${this.player.role.name}**!`);
		await this.player.role.init();
	}

	public canUseAction() {
		const validTargets = this.game.players.filter(this.canTarget.bind(this));
		if (validTargets.length === 0) return { check: false, reason: 'There are no valid targets.' };
		return { check: true, reason: '' };
	}

	public canTarget(target: Player) {
		if (target.isAlive) return { check: false, reason: 'You can only remember dead roles.' };
		if (target.cleaned) return { check: false, reason: 'You cannot remember cleaned roles.' };
		// @ts-ignore tsc cannot detect static properties
		if (target.role.constructor.unique && target.role.faction.name === 'Town') return { check: false, reason: 'You cannot remember as unique Town roles.' };
		return { check: true, reason: '' };
	}

}

Amnesiac.aliases = ['Amne'];
Amnesiac.categories = [...Amnesiac.categories, 'Neutral Benign', 'Good'];
