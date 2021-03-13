import SurivorFaction from '@mafia/factions/neutral/Survivor';
import { Defence, NightActionPriority } from '@mafia/managers/NightActionsManager';
import NoTarget from '@mafia/mixins/NoTarget';
import type Player from '@mafia/structures/Player';

export default class Survivor extends NoTarget {
	public name = 'Survivor';
	public faction = new SurivorFaction();
	public action = 'vest';
	public priority = NightActionPriority.SURVIVOR;

	private vested = false;
	private vests: number;

	public constructor(player: Player, context: SurvivorContext = {}) {
		super(player);
		if (typeof context.vests === 'number') this.vests = context.vests;
		else this.vests = this.getInitialVests();

		this.description = this.game.t('roles/neutral:survivorDescription', { count: this.vests });
		this.actionText = this.game.t('roles/actions:survivorText');
		this.actionGerund = this.game.t('roles/actions:survivorGerund');
	}

	public canUseAction() {
		if (this.vests === 0) return { check: false, reason: this.game.t('roles/neutral:survivorNoVests') };
		return super.canUseAction();
	}

	public get defence() {
		if (this.vested) return Defence.Basic;
		return Defence.None;
	}

	public setUp() {
		this.vested = true;
	}

	public runAction() {
		this.vests--;
	}

	public tearDown() {
		this.vested = false;
	}

	public get extraNightContext() {
		if (this.vests > 0) return this.game.t('roles/neutral:survivorContext', { count: this.vests });
		return null;
	}

	private getInitialVests() {
		if (this.game.players.length <= 5) return 1;
		if (this.game.players.length <= 10) return 2;
		return 4;
	}
}

export interface SurvivorContext {
	vests?: number;
}

Survivor.aliases = ['Surv'];
Survivor.categories = [...Survivor.categories, 'Random Neutral', 'Neutral Benign'];
