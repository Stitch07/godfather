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

	public async onNight() {
		// rampage at home by default
		if (!this.canRampage()) return;
		await this.game.nightActions.addAction({
			action: 'maul',
			actor: this.player,
			target: this.player,
			priority: this.priority,
			flags: {
				canBlock: false,
				canTransport: false,
				canVisit: false
			}
		});

		return super.onNight();
	}

	public runAction(actions: NightActionsManager, target: Player) {
		// WW rampages at home, killing all visitors
		if (target === this.player) return;
		return super.runAction(actions, target);
	}

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
		if (!this.canRampage()) return { check: false, reason: 'You can only rampage on even nights.' };
		return super.canUseAction();
	}

	public get innocence() {
		// Werewolves are innocent on odd nights
		return !this.canRampage();
	}

	public get defense() {
		return Defense.Basic;
	}

	public get attackStrength() {
		return Attack.Powerful;
	}

	// whether the Werewolf can rampage during this night
	private canRampage() {
		return this.game.cycle % 2 === 0;
	}

}

Werewolf.aliases = ['SK'];
