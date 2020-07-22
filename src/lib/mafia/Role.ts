import Player from '@mafia/Player';

export default abstract class Role {

	public cleaned = false;
	public name = '';
	public constructor(public player: Player) {
	}

	public get displayRole(): string {
		if (this.cleaned) return 'Cleaned';
		return this.name;
	}

	// events such as kills, game-start and lynches are called here
	public abstract async onEvent(name: string, ...args: Array<any>): Promise<any>;

	// Role categories such as Random Town, Neutral Evil
	public static categories: Array<string> = [];

	// Docs used in roleinfo command
	public static documentation = '';

}
