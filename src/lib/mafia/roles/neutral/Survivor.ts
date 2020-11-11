import ActionRole from '@mafia/mixins/ActionRole';
import SurivorFaction from '@mafia/factions/neutral/Survivor';
import { Defense, NightActionPriority } from '@mafia/managers/NightActionsManager';

export default class Survivor extends ActionRole {

	public name = 'Surivor';
	public description = 'A neutral character who just wants to live and is too afraid to die.';
	public faction = new SurivorFaction();
	public action = 'vest';
	public actionGerund = 'vesting';
	public actionText = 'protect yourself at night.';
	public priority = NightActionPriority.SURVIVOR;
	public flags = {
		canBlock: true,
		canTransport: true,
		canVisit: false
	};

	public vested = false;
	private vests = 4;

	public canUseAction() {
		if (this.vests === 0) {
			return { check: false, reason: 'You don\'t have any vests left' };
		}
		return super.canUseAction();
	}

	public get defense() {
		if (this.vested) {
			return Defense.Basic;
		}
		return Defense.None;
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
