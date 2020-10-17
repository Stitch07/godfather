import NightActionsManager from "@root/lib/mafia/managers/NightActionsManager";
import Townie from "@root/lib/mafia/mixins/Townie";
import Player from "@root/lib/mafia/Player";
import Cop from "../Cop";

// @ts-ignore
class Insane_Cop extends Cop {

	public name = 'Insane Cop';

	get displayName() {
		return 'Cop';
	}

	public async tearDown(actions: NightActionsManager, target: Player) {
		const innocence = this.innocenceModifier(target.role.innocence);
		await this.player.user.send(
			innocence ? 'Your target is suspicious.' : 'Your target is innocent.'
		);
	}

	public innocenceModifier(innocence: boolean) {
		return innocence;
	}
}

export default Townie(Insane_Cop);