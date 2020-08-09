import Player from '@mafia/Player';
import Faction from './Faction';
import { RoleEvent } from './managers/NightActionsManager';

export interface CanUseActionData {
	check: boolean;
	reason?: string;
}

abstract class Role {

	public name = '';
	public description = '';
	public readonly voteWeight = 1;
	public constructor(public player: Player) {
	}

	public get display(): string {
		if (this.player.cleaned) return 'Cleaned';
		return this.name;
	}

	public canUseAction(): CanUseActionData {
		return { check: false, reason: '' };
	}

	// Role categories such as Random Town, Neutral Evil
	public static categories: string[] = [];

	// Docs used in roleinfo command
	public static documentation = '';

}

interface Role {
	onEvent(event: RoleEvent, ...args: any[]): Promise<any>;
	onEvent(event: RoleEvent.NIGHT_START): Promise<any>;
	onEvent(event: RoleEvent.PM_COMMAND, ...args: string[]): Promise<any>;
	onLynch(): Promise<any>;
	faction: Faction;
}

export default Role;
