import JuggernautFaction from '@mafia/factions/neutral/Juggernaut';
import NightActionsManager, { Attack, Defense, NightActionPriority } from '@mafia/managers/NightActionsManager';
import Killer from '@mafia/mixins/Killer';
import Player from '@mafia/Player';

class Juggernaut extends Killer {

	public name = 'Juggernaut';
	public faction = new JuggernautFaction();
	public action = 'assault';
	public actionGerund = 'assaulting';
	public actionText = 'assault a player';
	public actionParticiple = 'assaulted';
	public priority = NightActionPriority.JUGGERNAUT;

	// level 1 lets them attack every night, level 2 lets them rampage, ands level 3 gives them a unstoppable attack
	public level = 0;

	public get defense() {
		return Defense.Basic;
	}

	public get attackStrength() {
		if (this.level === 3) return Attack.Unstoppable;
		return Attack.Powerful;
	}

	public canUseAction() {
		if (!this.canAttack()) return { check: false, reason: 'You currently can only attack on full moons.' };
		return super.canUseAction();
	}

	public get extraNightContext() {
		return `You are currently level ${this.level.toString()}`;
	}

	public async runAction(actions: NightActionsManager, target: Player) {
		if (this.level >= 2) {
			const visitors = target.visitors.filter(player => player.user.id !== this.player.user.id);
			for (const visitor of visitors) {
				actions.record.setAction(visitor.user.id, 'nightkill', { result: true, by: [this.player], type: this.attackStrength });
				this.player.user.send('You attacked someone who visted your target!');
				await visitor.user.send('You were assaulted by a Juggernaut. You have died!');
			}
		}
		return super.runAction(actions, target);
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id).get('nightkill');
		const success = record.result && record.by.includes(this.player);
		if (!success) {
			return this.player.user.send('Your target was too strong to kill!');
		}
		if (this.level < 3) this.level++;
		return target.user.send('You were assaulted by a Juggernaut. You have died!');
	}

	private canAttack() {
		if (this.level === 0) return this.game.isFullMoon;
		return true;
	}

	public static unique = true;

}

Juggernaut.aliases = ['Jugg'];
Juggernaut.categories = [...Juggernaut.categories, 'Neutral Killing', 'Evil'];

export default Juggernaut;
