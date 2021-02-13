import JesterFaction from '@mafia/factions/neutral/Jester';
import NightActionsManager, { Attack, NightActionPriority } from '@mafia/managers/NightActionsManager';
import SingleTarget from '@mafia/mixins/SingleTarget';
import type Player from '@mafia/structures/Player';
import { randomArrayItem } from '@util/utils';
import { TrialVoteType } from '../../managers/VoteManager';

class Jester extends SingleTarget {
	public name = 'Jester';
	public faction = new JesterFaction();
	public action = 'haunt';
	public actionGerund = 'haunting';
	public actionText = 'haunt a player';
	public priority = NightActionPriority.JESTER_HAUNT;
	public flags = {
		canBlock: false,
		canTransport: false,
		canVisit: false,
		canWitch: false
	};

	// whether the Jester has been eliminated
	public wasEliminated = false;
	// players hammering the Jester
	public playersVoting: Player[] = [];

	public runAction(actions: NightActionsManager, target: Player) {
		actions.record.setAction(target.user.id, 'nightkill', { by: [this.player], result: true, type: Attack.Unstoppable });
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		return target.queueMessage(this.game.t('roles/neutral:jesterHaunt'));
	}

	// @ts-ignore weird bug
	public onDeath() {
		if (this.player.deathReason.includes('eliminated')) {
			this.wasEliminated = true;
			// in trials, jester can haunt people who don't vote innocent
			this.playersVoting = this.game.settings.enableTrials
				? this.game.votes.trialVotes.filter((vote) => vote.type !== TrialVoteType.Innocent).map((vote) => vote.by)
				: this.game.votes.on(this.player).map((vote) => vote.by);

			return this.game.channel.send(this.game.t('roles/neutral:jesterAlert'));
		}
	}

	public canTarget(target: Player) {
		if (this.playersVoting.some((player) => player.user.id === target.user.id)) return { check: true, reason: '' };
		return { check: false, reason: this.game.t('roles/neutral:jesterVotersOnly') };
	}

	public canUseAction() {
		return { check: this.wasEliminated && this.playersVoting.length > 0, reason: '' };
	}

	public get defaultAction() {
		const randomHaunt = randomArrayItem(this.playersVoting);
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

Jester.categories = [...Jester.categories, 'Neutral Evil', 'Evil'];

export default Jester;
