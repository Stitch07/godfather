import NoTarget from '@mafia/mixins/NoTarget';
import Townie from '@mafia/mixins/Townie';
import { Attack, Defense, NightActionPriority } from '@mafia/managers/NightActionsManager';
import Player from '@mafia/Player';

class Veteran extends NoTarget {

	public name = 'Veteran';
	public description = 'You may go on alert 3 times a game, killing all visitors.';
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
	private alerts = 3;

	public get defense() {
		if (this.onAlert) return Defense.Basic;
		return Defense.None;
	}

	public canUseAction() {
		if (this.alerts === 0) return { check: false, reason: 'You have no alerts left.' };
		return super.canUseAction();
	}

	public async onNight() {
		await super.onNight();
		if (this.alerts > 0) await this.player.user.send(`You have ${this.alerts} alerts remaining.`);
	}

	public setUp() {
		this.onAlert = true;
	}

	public runAction() {
		this.alerts--;
	}

	public async onVisit(visitor: Player) {
		if (this.onAlert && visitor.role.defense < Defense.Invincible) {
			this.game.nightActions.record.setAction(visitor.user.id, 'nightkill', { by: [this.player], result: true, type: Attack.Powerful });
			await visitor.user.send('You were killed by the veteran you visited!');
			return this.player.user.send('You shot someone who visted you.');
		}
	}

	public tearDown() {
		this.onAlert = false;
	}

}

Veteran.categories = [...Veteran.categories, 'Town Killing'];
Veteran.aliases = ['Vet'];

export default Townie(Veteran);
