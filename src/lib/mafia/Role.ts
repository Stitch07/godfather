import Player from '@mafia/Player';
import Faction from './Faction';

abstract class Role {

	public name = '';
	public description = '';
	public constructor(public player: Player) {
	}

	public get display(): string {
		if (this.player.cleaned) return 'Cleaned';
		return this.name;
	}

	// Role categories such as Random Town, Neutral Evil
	public static categories: string[] = [];

	// Docs used in roleinfo command
	public static documentation = '';

}

interface Role {
	onEvent(name: string, ...args: any[]): Promise<any>;
	faction: Faction;
}

export default Role;
