import JesterFaction from '@mafia/factions/neutral/Jester';
import type Player from '@mafia/structures/Player';
import { HauntAction } from '../../actions/common/HauntAction';
import type { NightAction } from '../../managers/NightAction';
import { TrialVoteType } from '../../managers/VoteManager';
import { ActionRole } from '../../structures/ActionRole';

class Jester extends ActionRole {
	public name = 'Jester';
	public faction = new JesterFaction();
	public actions: NightAction[];
	public flags = {
		canBlock: false,
		canTransport: false,
		canVisit: false,
		canWitch: false
	};

	public constructor(player: Player) {
		super(player);
		this.actions = [];
	}

	// @ts-ignore weird bug
	public async onDeath() {
		if (this.player.deathReason.includes('eliminated')) {
			// in trials, jester can haunt people who don't vote innocent
			const playersVoting = this.game.settings.trials
				? this.game.votes.trialVotes.filter((vote) => vote.type !== TrialVoteType.Innocent).map((vote) => vote.by)
				: this.game.votes.on(this.player).map((vote) => vote.by);

			this.actions.push(new HauntAction(this, playersVoting));
			await this.game.channel.send(this.game.t('roles/neutral:jesterAlert'));
		}

		// eslint-disable-next-line @typescript-eslint/no-empty-function
		return new Promise<void>(() => {});
	}
}

Jester.categories = [...Jester.categories, 'Random Neutral', 'Neutral Evil', 'Evil'];

export default Jester;
