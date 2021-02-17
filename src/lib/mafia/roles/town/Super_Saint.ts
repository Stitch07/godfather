import Townie from '@mafia/mixins/Townie';
import Role from '@mafia/structures/Role';
import { sleep } from '@util/utils';
import type Player from '@mafia/structures/Player';

class SuperSaint extends Role {
	public name = 'Super Saint';

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:superSaintDescription');
	}

	public async onDeath() {
		if (this.player.deathReason.startsWith('eliminated')) {
			const { game } = this.player;

			const votesOnSaint = game.votes.on(this.player);
			const { by: lastVoter } = votesOnSaint!.slice().pop()!;

			await lastVoter.kill(this.game.t('roles/town:superSaintDeathReason'));
			await game.channel.send(this.game.t('roles/town:superSaintBoom'));
			await sleep(2 * 1000);

			await game.channel.send(`${this.game.t('roles/town:superSaintAnnouncement', { player: lastVoter })} ${lastVoter.displayRoleAndWill()}`);
		}

		return super.onDeath();
	}
}

export default Townie(SuperSaint);
