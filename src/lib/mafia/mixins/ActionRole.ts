import Role from '@mafia/Role';
import NightActionsManager from '@mafia/managers/NightActionsManager';
import Player from '@mafia/Player';


export default class ActionRole extends Role {

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async setUp(actions: NightActionsManager, target?: Player) {
		// noop
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async runAction(actions: NightActionsManager, target?: Player) {
		// noop
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async tearDown(actions: NightActionsManager, target?: Player) {
		// noop
	}

	public canDoAction(): [boolean, string] {
		return [true, ''];
	}

}
