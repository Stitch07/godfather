import { Attack } from '@mafia/managers/NightActionsManager';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';
import type { Message } from 'discord.js';
import KillerAction from '../../actions/common/KillerAction';
import type { NightAction } from '../../managers/NightAction';
import { ActionRole, CanUseActionData } from '../../structures/ActionRole';

class Vigilante extends ActionRole {
	public name = 'Vigilante';
	public actions: NightAction[];
	public cycleGuiltObtained = -1;

	public constructor(player: Player) {
		super(player);
		const bullets = this.getInitialBullets();
		this.actions = [new KillerAction(this, Attack.Basic, 'shoot', player ? bullets : 0)];
		this.description = this.game.t('roles/town:vigilanteDescription', { count: bullets });
	}

	public onNight() {
		if (this.cycleGuiltObtained !== -1) {
			return this.player.user.send(this.game.t('roles/town:vigilanteGuilt'));
		}
		return super.onNight();
	}

	public onPmCommand(message: Message, command: string, ...args: string[]) {
		if (this.cycleGuiltObtained !== -1) {
			return this.player.user.send(this.game.t('roles/town:vigilanteGuilt'));
		}
		return super.onPmCommand(message, command, args[0]);
	}
      
	public canUseAction(): CanUseActionData {
		if (this.cycleGuiltObtained !== -1) {
			return { check: false, reason: this.game.t('roles/town:vigilanteGuilt') };
		}
		return super.canUseAction();
	}

	public async afterActions() {
		if (this.cycleGuiltObtained + 1 === this.game.cycle) {
			await this.player.kill(
				this.game.t(
					this.game.t('roles/global:killerMessage', { actionParticiple: this.game.t('roles/actions:killerParticiple'), role: this.name })
				)
			);
		}
	}
      
	private getInitialBullets() {
		if (this.game.players.length <= 5) return 1;
		if (this.game.players.length <= 10) return 2;
		return 4;
	}
}

Vigilante.categories = [...Vigilante.categories, 'Town Killing'];
Vigilante.aliases = ['Vig', 'Vigi'];

export default Townie(Vigilante);
