import { sleep } from '@util/utils';
import Townie from '@mafia/mixins/Townie';
import Role from '@mafia/structures/Role';

class SuperSaint extends Role {

	public name = 'Super Saint';

	public description = 'If lynched, you kill the last person voting you.';

	public async onDeath() {
		if (this.player.deathReason.startsWith('lynched')) {
			const { game } = this.player;

			const votesOnSaint = game.votes.on(this.player);
			const { by: lastVoter } = votesOnSaint!.slice().pop()!;

			lastVoter.kill('blown up by Super Saint');
			await game.channel.send('💣 **BOOOOOOOOOOOOOOM!!!**');
			await sleep(2 * 1000);

			await game.channel.send(`${lastVoter} hammered the Super Saint and was blown up! ${lastVoter.displayRoleAndWill()}`);
		}

		return super.onDeath();
	}

}

export default Townie(SuperSaint);
