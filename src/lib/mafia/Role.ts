import Player from '@mafia/Player';
import Faction from './Faction';

abstract class Role {

	public name = '';
	public constructor(public player: Player) {
	}

	public get display(): string {
		if (this.player.cleaned) return 'Cleaned';
		return this.name;
	}

	// Role categories such as Random Town, Neutral Evil
	public static categories: Array<string> = [];

	// Docs used in roleinfo command
	public static documentation = '';

}

interface Role {
	onEvent(name: string, ...args: Array<any>): Promise<any>;
	faction: Faction;
}

export default Role;
