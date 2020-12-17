import SingleTarget from '@root/lib/mafia/mixins/SingleTarget';
import MafiaRole from '@mafia/mixins/MafiaRole';
import { randomArray } from '@root/lib/util/utils';
import NightActionsManager, { Attack, NightActionPriority } from '@mafia/managers/NightActionsManager';
import Player from '@mafia/Player';

class Ambusher extends SingleTarget {

	public name = 'Ambusher';
	public description = 'You may set up at someones house each night and kill a visitor';
	public action = 'ambush';
	public actionText = 'set up a ambush';
	public actionGerund = 'ambushing';
	public priority = NightActionPriority.AMBUSHER;
	private killTarget: Player | null = null;

	public canTarget(target: Player) {
		if (target.role.faction.name === 'Mafia') return { check: false, reason: 'You cannot target yourself or your teammates' };
		return super.canTarget(target);
	}

	public runAction(actions: NightActionsManager, target: Player) {
		const visitors = target.visitors.filter(player => player.role.faction.name !== 'Mafia');
		const killTarget = randomArray(visitors);

		if (killTarget !== null) {
			this.killTarget = killTarget;
			actions.record.setAction(this.killTarget.user.id, 'nightkill', { result: true, by: [this.player], type: Attack.Unstoppable });
		}
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		if (this.killTarget !== null) {
			const record = actions.record.get(this.killTarget.user.id).get('nightkill');
			const success = record.result && record.by.some(player => this.player.user.id === player.user.id);

			for (const visitor of target.visitors) {
				if (visitor !== this.player && visitor.user.id !== this.killTarget.user.id) visitor.queueMessage(`You saw ${this.player.user.username} preparing an ambush for your target.`);
			}
			this.player.queueMessage('You attacked someone who visted your target.');
			if (!success) {
				return this.player.queueMessage('Your target was too strong to kill!');
			}
			this.killTarget.queueMessage('You were attacked by an ambusher. You have died!');
			this.killTarget = null;
		}
	}

}

Ambusher.categories = [...Ambusher.categories, 'Mafia Killing'];

export default MafiaRole(Ambusher);
