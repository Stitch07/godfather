import Player from '@mafia/Player';
import Faction from './Faction';

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

	// just for easier accessibility
	public get game() {
		return this.player.game;
	}

	public onDeath() {
		// noop
	}

	public onNight() {
		// noop
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
	onPmCommand(...args: string[]): void;
	onNight(): void;
	onDeath(): void;
	faction: Faction;
}

export default Role;
