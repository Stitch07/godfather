import Killer from '@mafia/mixins/Killer';
import MafiaRole from '@mafia/mixins/MafiaRole';
import type Player from '@mafia/structures/Player';
import type { Message } from 'discord.js';

class Goon extends Killer {
	public name = 'Goon';

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/mafia:goonDescription');
	}

	public async onPmCommand(message: Message, command: string, ...args: string[]) {
		const gfAction = this.game.nightActions.find((action) => action.actor.role.name === 'Godfather');
		if (gfAction) {
			return message.channel.send(
				gfAction.action === undefined
					? this.game.t('roles/mafia:goonMessageHome')
					: this.game.t('roles/mafia:goonMessageShoot', { target: gfAction.target! as Player })
			);
		}
		return super.onPmCommand(message, command, ...args);
	}

	public canUseAction() {
		if (this.game.setup!.name === 'dethy' && this.game.cycle === 1) {
			return { check: false, reason: this.game.t('roles/mafia:goonDethy') };
		}
		return super.canUseAction();
	}

	public static unique = true;
}

Goon.categories = [...Goon.categories, 'Mafia Killing'];
Goon.aliases = ['Mafioso'];

export default MafiaRole(Goon);
