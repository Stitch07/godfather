import ActionRole from '@mafia/mixins/ActionRole';
import MafiaRole from '@mafia/mixins/MafiaRole';
import NightActionsManager, { NightActionPriority } from '../../managers/NightActionsManager';
import Player from '../../Player';

class Ambusher extends ActionRole {

	public name = 'Ambusher';
	public description = 'You may set up at someones house each night and kill a visitor';
	public action = 'ambush';
	public actionText = 'set up a ambush';
	public actionGerund = 'ambushing';
	public priority = NightActionPriority.AMBUSHER;

	public canTarget(target: Player) {
		if (target.role.faction.name !== 'Mafia') return { check: true, reason: '' };
		return { check: false, reason: 'You cannot target yourself or your teammates' };
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const visitors = target.visitors.filter(visitor => visitor !== this.player);
		if (visitors.length === 0) {
			return this.player.user.send('Nobody visted your target.');
		}
		const random = Math.floor(Math.random() * visitors.length);
		const killTarget = visitors[random];

		visitors.forEach(e => {
			void e.user.send(`You saw ${this.player.user.username} preparing an ambush!`);
		});

		const record = actions.record.get(killTarget.user.id).get('nightkill');
		const success = record.result && record.by.some(player => this.player.user.id === player.user.id);
		this.player.user.send('You attacked someone who visted your target.');
		if (!success) {
			return this.player.user.send('Your target was too strong to kill!');
		}
		return killTarget.user.send('You were attacked by an ambusher. You have died!');
	}

}

export default MafiaRole(Ambusher);
