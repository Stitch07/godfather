import { sleep } from '@klasa/utils';

import Role from '@mafia/Role';
import { ON_LYNCH } from '@mafia/events';

export default class SuperSaint extends Role {

	public name = 'Super Saint';

	public async onEvent(name: string) {
		if (name === ON_LYNCH) {
			const { game } = this.player;
			// super saint kills the last person to vote them
			const votesOnSaint = game.votes.get(this.player.user.id);
			const lastVoter = votesOnSaint!.slice().pop()!.by;
			lastVoter.kill('blown up by Super Saint');
			await game.channel.sendMessage('💣 **BOOOOOOOOOOOOOOM!!!**');
			await sleep(2 * 1000);
			await game.channel.sendMessage(`${lastVoter} hammered the Super Saint and was blown up!`);
		}
	}

	public static documentation = 'Roleinfo docs here.';

}
