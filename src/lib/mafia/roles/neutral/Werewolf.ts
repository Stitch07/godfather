import Killer from '#mafia/mixins/Killer';
import NightActionsManager, { Attack, Defence } from '#mafia/managers/NightActionsManager';
import WerewolfFaction from '#mafia/factions/neutral/Werewolf';
import Player from '#mafia/structures/Player';

export default class Werewolf extends Killer {

	public name = 'Werewolf';
	public description = 'You may rampage at someone\'s house every night.';
	public faction = new WerewolfFaction();
	public action = 'maul';
	public actionGerund = 'mauling';
	public actionText = 'maul a player';
	public actionParticiple = 'mauled';

	public runAction(actions: NightActionsManager, target: Player) {
		// WW rampages at home, killing all visitors
		if (target === this.player) return;
		return super.runAction(actions, target);
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		// kill all visitors
		const visitors = target.visitors.filter(player => player.user.id !== this.player.user.id);
		for (const visitor of visitors) {
			if (visitor.role.actualDefence > this.attackStrength) continue;
			actions.record.setAction(visitor.user.id, 'nightkill', { result: true, by: [this.player], type: this.attackStrength });
			visitor.queueMessage('You were mauled by a Werewolf!');
		}
		return super.tearDown(actions, target);
	}

	public canUseAction() {
		if (!this.canRampage()) return { check: false, reason: 'You can only rampage on full moons.' };
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

Werewolf.categories = [...Werewolf.categories, 'Neutral Killing', 'Evil'];
Werewolf.aliases = ['WW'];
