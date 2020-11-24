import SurivorFaction from '@mafia/factions/neutral/Survivor';
import { Defense, NightActionPriority } from '@mafia/managers/NightActionsManager';
import NoTarget from '@mafia/mixins/NoTarget';

export default class Survivor extends NoTarget {

	public name = 'Survivor';
	public description = 'You may vest 4 times in a game.';
	public faction = new SurivorFaction();
	public action = 'vest';
	public actionGerund = 'vesting';
	public actionText = 'protect yourself at night';
	public priority = NightActionPriority.SURVIVOR;
	public flags = {
		canBlock: true,
		canTransport: true,
		canVisit: false
	};

	public vested = false;
	public vests = 4;

	public canUseAction() {
		if (this.vests === 0) return { check: false, reason: 'You don\'t have any vests left' };
		return super.canUseAction();
	}

	public get defense() {
		if (this.vested) return Defense.Basic;
		return Defense.None;
	}

	public async onNight() {
		// send action PMs
		await super.onNight();
		if (this.vests > 0) await this.player.user.send(`You have ${this.vests} vests remaining.`);
	}

	public setUp() {
		this.vested = true;
	}

	public runAction() {
		this.vests--;
	}

	public tearDown() {
		this.vested = false;
	}

}

Survivor.aliases = ['Surv'];
Survivor.categories = [...Survivor.categories, 'Neutral Benign', 'Good'];
