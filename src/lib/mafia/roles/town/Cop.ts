import ActionRole from '@mafia/mixins/ActionRole';
import NightActionsManager, { NightActionCommand, NightActionPriority } from '@mafia/managers/NightActionsManager';
import Player from '@mafia/Player';
import Townie from '@mafia/mixins/Townie';

class Cop extends ActionRole {

	public name = 'Cop';

	public action = NightActionCommand.Check;
	public actionGerund = 'checking';
	public actionText = 'check a player';
	public flags = {
		canBlock: true,
		canTransport: true,
		canVisit: true
	};

	public priority = NightActionPriority.COP;

	// ensures that Dethy cops don't get PMed their real role
	public get display(): string {
		if (this.player.cleaned) return 'Cleaned';
		return this.name;
	}

	public async tearDown(actions: NightActionsManager, target: Player) {
		let innocence = this.innocenceModifier(target.role.innocence);
		if (actions.framedPlayers.includes(target)) innocence = !innocence;
		await this.player.user.send(innocence ? 'Your target is innocent.' : 'Your target is suspicious.');
	}

	public innocenceModifier(innocence: boolean) {
		// dethy cops can use this
		return innocence;
	}

	public static documentation = 'Roleinfo docs here.';

}

export default Townie(Cop);
