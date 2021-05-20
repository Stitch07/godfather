import { Attack, NightActionPriority } from '@mafia/managers/NightActionsManager';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';
import type { Message } from 'discord.js';
import KillerAction from '../../actions/common/KillerAction';
import type { NightAction } from '../../managers/NightAction';
import { ActionRole } from '../../structures/ActionRole';

class Vigilante extends ActionRole {
	public name = 'Vigilante';
	public actions: NightAction[];
	public guilt = false;

	public constructor(player: Player) {
		super(player);
		this.actions = [new KillerAction(this, Attack.Basic, 'shoot', player ? this.getInitialBullets() : 0)];
		this.description = this.game.t('roles/town:vigilanteDescription');
	}

	public async onNight() {
		if (this.guilt) {
			await this.game.nightActions.addAction({
				action: this.actions[0],
				actor: this.player,
				target: this.player,
				priority: NightActionPriority.VIGI_SUICIDE
			});

			return this.player.user.send(this.game.t('roles/town:vigilanteGuilt'));
		}
		return super.onNight();
	}

	public onPmCommand(message: Message, command: string, ...args: string[]) {
		if (this.guilt) {
			return this.player.user.send(this.game.t('roles/town:vigilanteGuilt'));
		}
		return super.onPmCommand(message, command, args[0]);
	}

	public get extraNightContext() {
		const bulletsRemaining = this.actions[0].remainingUses;
		// Infinity bullets = no limit
		if (bulletsRemaining > 0 && bulletsRemaining !== Infinity)
			return this.game.t('roles/global:killerContext', {
				bullets: bulletsRemaining === 1 ? this.game.t('roles/global:bullet') : this.game.t('roles/global:bulletPlural'),
				amount: bulletsRemaining
			});
		return null;
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
