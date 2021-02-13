import { Attack, Defence, NightActionPriority } from '@mafia/managers/NightActionsManager';
import NoTarget from '@mafia/mixins/NoTarget';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';

class Veteran extends NoTarget {
	public name = 'Veteran';
	public action = 'alert';
	public priority = NightActionPriority.VETERAN;
	public flags = {
		canBlock: false,
		canTransport: true,
		canVisit: false,
		canWitch: false
	};

	private onAlert = false;
	private alerts: number;

	public constructor(player: Player) {
		super(player);
		this.alerts = player === null ? 0 : this.getInitialAlerts();
		this.description = this.game.t('roles/town:veteranDescription', { count: this.alerts });
		this.actionText = this.game.t('roles/actions:veteranText');
		this.actionGerund = this.game.t('roles/actions:veteranGerund');
	}

	public get defence() {
		if (this.onAlert) return Defence.Basic;
		return Defence.None;
	}

	public canUseAction() {
		if (this.alerts === 0) return { check: false, reason: this.game.t('roles/town:veteranNoAlerts') };
		return super.canUseAction();
	}

	public setUp() {
		this.onAlert = true;
	}

	public runAction() {
		this.alerts--;
	}

	public onVisit(visitor: Player) {
		if (this.onAlert && visitor.role.actualDefence < Defence.Invincible) {
			this.game.nightActions.record.setAction(visitor.user.id, 'nightkill', { by: [this.player], result: true, type: Attack.Powerful });
			visitor.queueMessage(this.game.t('roles/town:veteranAlert'));
			return this.player.queueMessage(this.game.t('roles/town:veteranMessage'));
		}
	}

	public tearDown() {
		this.onAlert = false;
	}

	public get extraNightContext() {
		if (this.alerts > 0) return this.game.t('roles/town:veteranAlertCount', { count: this.alerts });
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
