import NoTarget from '@mafia/mixins/NoTarget';
import Townie from '@mafia/mixins/Townie';
import NightActionsManager, { Attack, Defense, NightActionPriority } from '@mafia/managers/NightActionsManager';

class Veteran extends NoTarget {

	public name = 'Veteran';
	public description = 'You may go on alert 3 times a game, well on alert, you gain a basic defense and deal a Powerful attack against all vistors';
	public action = 'alert';
	public actionGerund = 'going on alert tonight';
	public actionText = 'go on alert';
	public priority = NightActionPriority.VETERAN;
	public flags = {
		canBlock: false,
		canTransport: true,
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

	public runAction(actions: NightActionsManager) {
		this.alerts--;
		for (const vistor of this.player.visitors) {
			actions.record.setAction(vistor.user.id, 'nightkill', { by: [this.player], result: true, type: Attack.Powerful });
			return this.player.user.send('You shot someone who visted you.');
		}
	}

	public tearDown(actions: NightActionsManager) {
		this.onAlert = false;
		for (const vistor of this.player.visitors) {
			const record = actions.record.get(vistor.user.id).get('nightkill');
			const success = record.result && record.by.some(player => this.player.user.id === player.user.id);
			if (!success) {
				// veteran isn't told if their target died or not
				return vistor.user.send('You were shot by a Veteran you visted!');
			}
			return vistor.user.send('You were shot by a Veteran you visted! You have died!');
		}
	}

}

Veteran.categories.push('Town Killing');
Veteran.aliases = ['Vet'];

export default Townie(Veteran);
