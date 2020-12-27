import NoTarget from '#mafia/mixins/NoTarget';
import Townie from '#mafia/mixins/Townie';
import { Attack, Defense, NightActionPriority } from '#mafia/managers/NightActionsManager';
import Player from '#mafia/Player';
import { pluralize } from '#root/lib/util/utils';

class Veteran extends NoTarget {

	public name = 'Veteran';
	public action = 'alert';
	public actionGerund = 'going on alert';
	public actionText = 'go on alert';
	public priority = NightActionPriority.VETERAN;
	public flags = {
		canBlock: false,
		canTransport: false,
		canVisit: false
	};

	private onAlert = false;
	private alerts: number;

	public constructor(player: Player) {
		super(player);
		this.alerts = player === null ? 0 : this.getInitialAlerts();
		this.description = `You may go on alert ${pluralize(this.alerts, 'time')} in a game, killing all visitors.`;
	}

	public get defense() {
		if (this.onAlert) return Defense.Basic;
		return Defense.None;
	}

	public canUseAction() {
		if (this.alerts === 0) return { check: false, reason: 'You have no alerts left.' };
		return super.canUseAction();
	}

	public setUp() {
		this.onAlert = true;
	}

	public runAction() {
		this.alerts--;
	}

	public onVisit(visitor: Player) {
		if (this.onAlert && visitor.role.defense < Defense.Invincible) {
			this.game.nightActions.record.setAction(visitor.user.id, 'nightkill', { by: [this.player], result: true, type: Attack.Powerful });
			visitor.queueMessage('You were killed by the veteran you visited!');
			return this.player.queueMessage('You shot someone who visited you.');
		}
	}

	public tearDown() {
		this.onAlert = false;
	}

	public get extraNightContext() {
		if (this.alerts > 0) return `You have ${this.alerts} alerts remaining.`;
		return null;
	}

	private getInitialAlerts() {
		if (this.game.players.length <= 5) return 1;
		if (this.game.players.length <= 10) return 2;
		return 3;
	}

	public static unique = true;

}

Veteran.categories = [...Veteran.categories, 'Town Killing'];
Veteran.aliases = ['Vet'];

export default Townie(Veteran);
