import { sleep } from '@lib/util/utils';
import Townie from '@mafia/mixins/Townie';

export default class SuperSaint extends Townie {

	public name = 'Super Saint';

	public async onDeath() {
		if (this.player.deathReason.startsWith('lynched')) {
			const { game } = this.player;

			// super saint kills the last person to vote them
			const votesOnSaint = game.votes.on(this.player);
			const { by: lastVoter } = votesOnSaint!.slice().pop()!;

			lastVoter.kill('blown up by Super Saint');
			await game.channel.send('💣 **BOOOOOOOOOOOOOOM!!!**');
			await sleep(2 * 1000);
			await game.channel.send(`${lastVoter} hammered the Super Saint and was blown up!`);
		}
	}

	public static documentation = 'Roleinfo docs here.';

}
