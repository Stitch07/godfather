import WerewolfFaction from '@mafia/factions/neutral/Werewolf';
import { Attack, Defence, NightActionEntry } from '@mafia/managers/NightActionsManager';
import type Player from '@mafia/structures/Player';
import KillerAction from '../../actions/common/KillerAction';
import type { NightAction } from '../../managers/NightAction';
import { ActionRole } from '../../structures/ActionRole';

export default class Werewolf extends ActionRole {
	public name = 'Werewolf';
	public faction = new WerewolfFaction();
	public actions: NightAction[] = [new KillerAction(this, Attack.Powerful, 'maul')];

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/neutral:werewolfDescription');
	}

	public get innocence() {
		// Werewolves are innocent on odd nights
		return !this.canRampage();
	}

	public get defence() {
		return Defence.Basic;
	}

	public get attackStrength() {
		return Attack.Powerful;
	}

	public canUseAction() {
		if (!this.canRampage()) return { check: false, reason: this.game.t('roles/neutral:werewolfFullMoons') };
		return super.canUseAction();
	}

	public get defaultAction(): NightActionEntry {
		return {
			action: this.actions[0],
			actor: this.player,
			target: this.player,
			priority: this.actions[0].priority,
			flags: {
				canBlock: false,
				canTransport: false,
				canVisit: false
			}
		};
	}

	// whether the Werewolf can rampage during this night
	public canRampage() {
		return this.game.isFullMoon;
	}
}

Werewolf.categories = [...Werewolf.categories, 'Random Neutral', 'Neutral Killing', 'Evil'];
Werewolf.aliases = ['WW'];
