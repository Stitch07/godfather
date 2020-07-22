import Role from '@mafia/Role';
import Player from '@mafia/Player';

class Vanilla extends Role {

	public name = 'Vanilla';
	public constructor(public player: Player) {
		super(player);
	}

	public onEvent(event: string, ...args: any[]) {
		return Promise.resolve(null);
	}

	public static documentation = 'Roleinfo docs here.';

}

export default Vanilla;
