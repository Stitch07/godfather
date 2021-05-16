import { Attack, Defence, NightActionPriority } from '@mafia/managers/NightActionsManager';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';
import { NoTargetAction } from '../../actions/mixins/NoTargetAction';
import { ActionRole } from '../../structures/ActionRole';

class Veteran extends ActionRole {
	public name = 'Veteran';
	public alerts: number;
	public onAlert = false;

	public constructor(player: Player) {
		super(player);
		this.alerts = player === null ? 0 : this.getInitialAlerts();
		this.description = this.game.t('roles/town:veteranDescription', { count: this.alerts });
	}

	public get defence() {
		if (this.onAlert) return Defence.Basic;
		return Defence.None;
	}

	public canUseAction() {
		if (this.alerts === 0) return { check: false, reason: this.game.t('roles/town:veteranNoAlerts') };
		return super.canUseAction();
	}

	public onVisit(visitor: Player) {
		if (this.onAlert && visitor.role.actualDefence < Defence.Invincible) {
			this.game.nightActions.record.setAction(visitor.user.id, 'nightkill', { by: [this.player], result: true, type: Attack.Powerful });
			visitor.queueMessage(this.game.t('roles/town:veteranAlert'));
			return this.player.queueMessage(this.game.t('roles/town:veteranMessage'));
		}
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

export class VeteranAlert extends NoTargetAction {
	public name = 'alert';
	public priority = NightActionPriority.VETERAN;
	public flags = {
		canBlock: false,
		canTransport: true,
		canVisit: false,
		canWitch: false
	};

	public constructor(role: ActionRole) {
		super(role);
		this.actionText = this.game.t('roles/actions:veteranText');
		this.actionGerund = this.game.t('roles/actions:veteranGerund');
	}

	public get extraNightContext() {
		if ((this.role as Veteran).alerts > 0) return this.game.t('roles/town:veteranAlertCount', { count: (this.role as Veteran).alerts });
		return null;
	}

	public setUp() {
		(this.role as Veteran).onAlert = true;
	}

	public runAction() {
		(this.role as Veteran).alerts--;
	}

	public tearDown() {
		(this.role as Veteran).onAlert = false;
	}
}
