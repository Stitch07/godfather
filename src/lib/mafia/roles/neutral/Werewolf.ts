import Killer from '@mafia/mixins/Killer';
import NightActionsManager, { Attack, Defense } from '@mafia/managers/NightActionsManager';
import WerewolfFaction from '@mafia/factions/neutral/Werewolf';
import Player from '@mafia/Player';

export default class Werewolf extends Killer {

	public name = 'Werewolf';
	public description = 'You may rampage at someone\'s house every night.';
	public faction = new WerewolfFaction();
	public action = 'maul';
	public actionGerund = 'mauling';
	public actionText = 'maul a player';
	public actionParticiple = 'mauled';

	public async tearDown(actions: NightActionsManager, target: Player) {
		// kill all visitors
		const visitors = target.visitors.filter(player => player !== this.player);
		for (const visitor of visitors) {
			actions.record.setAction(visitor.user.id, 'nightkill', { result: true, by: [this.player], type: this.attackStrength });
			await visitor.user.send('You were mauled by a Werewolf. You have died!');
		}
		return super.tearDown(actions, target);
	}

	public canUseAction() {
		if (this.game.cycle % 2 === 1) return { check: false, reason: 'You can only rampage on even nights.' };
		return super.canUseAction();
	}

	public get innocence() {
		// Werewolves are innocent on odd nights
		return this.game.cycle % 2 === 1;
	}

	public get defense() {
		return Defense.Basic;
	}

	public get attackStrength() {
		return Attack.Powerful;
	}

}

Werewolf.aliases = ['SK'];
