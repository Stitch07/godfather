import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';
import type { Message } from 'discord.js';
import { ActionRole } from '../../structures/ActionRole';

class Vigilante extends ActionRole {
	public name = 'Vigilante';
	public shootingMechanism: string;
	private guilt = false;

	public constructor(player: Player) {
		super(player);
		this.shootingMechanism = this.game.t('roles/global:bullet');
		this.bullets = player ? this.getInitialBullets() : 0;
		this.description = this.game.t('roles/town:vigilanteDescription');
	}

	public async onNight() {
		if (this.guilt) {
			await this.game.nightActions.addAction({
				action: this.action,
				actor: this.player,
				target: this.player,
				priority: NightActionPriority.VIGI_SUICIDE,
				flags: this.flags
			});

			await this.player.user.send(this.game.t('roles/town:vigilanteGuilt'));
		} else {
			return super.onNight();
		}
	}

	public onPmCommand(message: Message, command: string, ...args: string[]) {
		if (this.guilt) {
			return this.player.user.send(this.game.t('roles/town:vigilanteGuilt'));
		}
		return super.onPmCommand(message, command, args[0]);
	}

	public canUseAction() {
		if (this.bullets === 0)
			return { check: false, reason: this.game.t('roles/global:outOfBullets', { shootingMechanism: this.shootingMechanism }) };
		return super.canUseAction();
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		if (target.role.faction.name === 'Town') {
			this.guilt = true;
		}
		return super.tearDown(actions, target);
	}

	public get extraNightContext() {
		// Infinity bullets = no limit
		if (this.bullets > 0 && this.bullets !== Infinity)
			return this.game.t('roles/global:killerContext', {
				bullets: this.bullets === 1 ? this.game.t('roles/global:bullet') : this.game.t('roles/global:bulletPlural'),
				amount: this.bullets
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
