import Killer from '@root/lib/mafia/mixins/Killer';
import MafiaRole from '@mafia/mixins/MafiaRole';
import { Message } from 'discord.js';
import Player from '@mafia/Player';

class Goon extends Killer {

	public name = 'Goon';
	public description = 'You may shoot someone every night.';

	public async onPmCommand(message: Message, command: string, ...args: string[]) {
		const gfAction = this.game.nightActions.find(action => action.actor.role.name === 'Godfather');
		if (gfAction) {
			return message.channel.send(gfAction.action === undefined ? 'The Godfather has ordered you to stay home tonight' : `The Godfather has ordered you to shoot ${(gfAction.target! as Player).user.username} tonight.`);
		}
		return super.onPmCommand(message, command, ...args);
	}

	public canUseAction() {
		if (this.game.setup!.name === 'dethy' && this.game.cycle === 1) {
			return { check: false, reason: 'You cannot use your action ' };
		}
		return super.canUseAction();
	}

	public static unique = true;

}

Goon.categories = [...Goon.categories, 'Mafia Killing'];
Goon.aliases = ['Mafioso'];

export default MafiaRole(Goon);
