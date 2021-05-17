import WerewolfFaction from '@mafia/factions/neutral/Werewolf';
import NightActionsManager, { Attack, Defence } from '@mafia/managers/NightActionsManager';
import type Player from '@mafia/structures/Player';
import { ActionRole } from '../../structures/ActionRole';

export default class Werewolf extends ActionRole {
	public name = 'Werewolf';
	public faction = new WerewolfFaction();
	public action = 'maul';

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/neutral:werewolfDescription');
		this.actionText = this.game.t('roles/actions:werewolfText');
		this.actionGerund = this.game.t('roles/actions:werewolfGerund');
		this.actionParticiple = this.game.t('roles/actions:werewolfParticiple');
	}

	public runAction(actions: NightActionsManager, target: Player) {
		// WW rampages at home, killing all visitors
		if (target === this.player) return;
		return super.runAction(actions, target);
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		// kill all visitors
		const visitors = target.visitors.filter((player) => player.user.id !== this.player.user.id);
		for (const visitor of visitors) {
			if (visitor.role.actualDefence > this.attackStrength) continue;
			actions.record.setAction(visitor.user.id, 'nightkill', { result: true, by: [this.player], type: this.attackStrength });
			visitor.queueMessage(this.game.t('roles/neutral:werewolfMaul'));
		}
		return super.tearDown(actions, target);
	}

	public canUseAction() {
		if (!this.canRampage()) return { check: false, reason: this.game.t('roles/neutral:werewolfFullMoons') };
		return super.canUseAction();
	}

	public get innocence() {
		// Werewolves are innocent on odd nights
		return !this.canRampage();
	}

	public get defence() {
		return Defence.Basic;
	}

	public get attackStrength() {
		return Attack.Powerful;
	}

	public canTarget(target: Player) {
		if (target === this.player && this.player.isAlive) return { check: true, reason: '' };
		return super.canTarget(target);
	}

	public get defaultAction() {
		return {
			action: 'maul',
			actor: this.player,
			target: this.player,
			priority: this.priority,
			flags: {
				canBlock: false,
				canTransport: false,
				canVisit: false
			}
		};
	}

	// whether the Werewolf can rampage during this night
	private canRampage() {
		return this.game.isFullMoon;
	}
}

Werewolf.categories = [...Werewolf.categories, 'Random Neutral', 'Neutral Killing', 'Evil'];
Werewolf.aliases = ['WW'];
