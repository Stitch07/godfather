import SingleTarget from '@root/lib/mafia/mixins/SingleTarget';
import JesterFaction from '@mafia/factions/neutral/Jester';
import NightActionsManager, { Attack, NightActionPriority } from '@mafia/managers/NightActionsManager';
import Player from '@mafia/Player';
import { randomArray } from '@util/utils';

export default class Jester extends SingleTarget {

	public name = 'Jester';
	public faction = new JesterFaction();
	public action = 'haunt';
	public actionGerund = 'haunting';
	public actionText = 'haunt a player';
	public priority = NightActionPriority.JESTER_HAUNT;
	public flags = {
		canBlock: false,
		canTransport: false,
		canVisit: false
	};

	// whether the Jester has been lynched
	public wasLynched = false;
	// players hammering the Jester
	public playersVoting: Player[] = [];

	public runAction(actions: NightActionsManager, target: Player) {
		actions.record.setAction(target.user.id, 'nightkill', { by: [this.player], result: true, type: Attack.Unstoppable });
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		return target.user.send('You were haunted by a Jester. You have died!');
	}

	public onDeath() {
		if (this.player.deathReason.includes('lynched')) {
			this.wasLynched = true;
			this.playersVoting = this.game.votes.on(this.player).map(vote => vote.by);
			return this.game.channel.send('**The Jester will get revenge from his grave!**');
		}
	}

	public canTarget(target: Player) {
		if (this.playersVoting.some(player => player.user.id === target.user.id)) return { check: true, reason: '' };
		return { check: false, reason: 'You can only haunt players who voted you.' };
	}

	public canUseAction() {
		return { check: this.wasLynched && this.playersVoting.length > 0, reason: '' };
	}

	public get defaultAction() {
		const randomHaunt = randomArray(this.playersVoting);
		if (randomHaunt) {
			return {
				actor: this.player,
				target: randomHaunt,
				priority: this.priority,
				action: this.action
			};
		}
		return null;
	}

}

Jester.categories = [...Jester.categories, 'Neutral Evil'];
