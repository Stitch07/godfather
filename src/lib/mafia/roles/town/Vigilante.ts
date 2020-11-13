import Shooter from '@mafia/mixins/Shooter';
import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import Townie from '@mafia/mixins/Townie';
import Player from '@mafia/Player';
import { Message } from 'discord.js';

class Vigilante extends Shooter {

	public name = 'Vigilante';
	public description = 'You may shoot someone every night.';
	private guilt = false;

	public async onNight() {
		if (this.guilt) {
			this.game.nightActions.addAction({
				action: this.action,
				actor: this.player,
				target: this.player,
				priority: NightActionPriority.VIGI_SUICIDE,
				flags: this.flags
			});

			await this.player.user.send('You cannot shoot tonight due to guilt.');
		} else {
			return super.onNight();
		}
	}

	public onPmCommand(message: Message, command: string, ...args: string[]) {
		if (this.guilt) {
			return this.player.user.send('You cannot shoot tonight due to guilt.');
		}
		return super.onPmCommand(message, command, args[0]);
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id).get('nightkill');
		const success = record.result && record.by.includes(this.player);
		if (!success) {
			return this.player.user.send('Your target was too strong to kill!');
		}

		if (target.role.faction.name === 'Town') {
			this.guilt = true;
		}
		return target.user.send('You were shot by a Vigilante. You have died!');
	}

}

Vigilante.categories = ['Town Killing'];
Vigilante.aliases = ['Vig', 'Vigi'];

export default Townie(Vigilante);
