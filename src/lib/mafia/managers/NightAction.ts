import type { Awaited } from '@sapphire/utilities';
import type { ActionRole, CanUseActionData } from '../structures/ActionRole';
import type Game from '../structures/Game';
import type Player from '../structures/Player';
// @ts-ignore type bs
import NightActionsManager, { NightActionPriority } from './NightActionsManager';

export type OneOrMultiplePlayers = Player | Player[];

export abstract class NightAction {
	public name!: string;

	public constructor(public role: ActionRole, public remainingUses = Number.POSITIVE_INFINITY) {}

	public canUse(target?: OneOrMultiplePlayers): CanUseActionData {
		if (this.remainingUses === 0) return { check: false, reason: this.game.t(`roles/global:${this.name}RunOut`) };
		return this.canUse(target);
	}

	public abstract setUp(actions: NightActionsManager, target?: OneOrMultiplePlayers): Awaited<any>;

	public abstract runAction(actions: NightActionsManager, target?: OneOrMultiplePlayers): Awaited<any>;

	public abstract tearDown(actions: NightActionsManager, target?: OneOrMultiplePlayers): Awaited<any>;

	public abstract runDayCommand(actions: NightActionsManager): Awaited<any>;

	public abstract confirmation(target?: OneOrMultiplePlayers): string;

	// eslint-disable-next-line @typescript-eslint/class-literal-property-style
	public get extraNightContext(): string | null {
		return null;
	}

	public get game() {
		return this.role.game;
	}

	public get player() {
		return this.role.player;
	}
}

export interface NightAction {
	action: string;
	actionGerund: string;
	actionText: string;
	flags?: {
		canBlock?: boolean;
		canTransport?: boolean;
		canVisit?: boolean;
		canWitch?: boolean;
	};
	priority: NightActionPriority;
	getTarget(args: string[], game: Game): OneOrMultiplePlayers;
}
