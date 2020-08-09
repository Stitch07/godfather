import { sleep } from '@klasa/utils';
import Townie from '@mafia/mixins/Townie';

export default class SuperSaint extends Townie {

	public name = 'Super Saint';

	public async onLynch() {
		const { game } = this.player;
		// super saint kills the last person to vote them
		const votesOnSaint = game.votes.on(this.player);
		const { by: lastVoter } = votesOnSaint!.slice().pop()!;
		lastVoter.kill('blown up by Super Saint');
		await game.channel.sendMessage('💣 **BOOOOOOOOOOOOOOM!!!**');
		await sleep(2 * 1000);

		await game.channel.sendMessage(`**${lastVoter.user.tag}** hammered the Super Saint and was blown up!\nThey were a **${lastVoter.role?.faction.name} ${lastVoter.role?.name}**.`);
	}

	public static documentation = 'Roleinfo docs here.';

}
