import type { Awaited } from '@sapphire/utilities';
import type { ActionRole, CanUseActionData } from '../structures/ActionRole';
import type Game from '../structures/Game';
import type Player from '../structures/Player';
// @ts-ignore type bs
import NightActionsManager, { NightActionPriority } from './NightActionsManager';

export type ZeroOrMultiplePlayers = null | Player | Player[];

export abstract class NightAction {
	public name!: string;

	public constructor(public role: ActionRole) {}

	public abstract canUse(target: ZeroOrMultiplePlayers): CanUseActionData;

	public abstract getTarget(args: string[], game: Game): ZeroOrMultiplePlayers;

	public abstract setUp(actions: NightActionsManager, target: ZeroOrMultiplePlayers): Awaited<any>;

	public abstract runAction(actions: NightActionsManager, target: ZeroOrMultiplePlayers): Awaited<any>;

	public abstract tearDown(actions: NightActionsManager, target: ZeroOrMultiplePlayers): Awaited<any>;

	public abstract runDayCommand(actions: NightActionsManager): Awaited<any>;

	public abstract confirmation(target: ZeroOrMultiplePlayers): string;

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
}
