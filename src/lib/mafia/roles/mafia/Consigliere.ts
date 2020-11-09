import NightActionsManager, { NightActionCommand, NightActionPriority } from '@mafia/managers/NightActionsManager';
import ActionRole from '@mafia/mixins/ActionRole';
import MafiaRole from '@mafia/mixins/MafiaRole';
import Player from '@mafia/Player';

class Consigliere extends ActionRole {

	public name = 'Consigliere';
	public description = 'A corrupted investigator who has been bribed to gather information for Mafia.';

	public action = NightActionCommand.Check;
	public actionGerund = 'investigating';
	public actionText = 'investigate a player';
	public flags = {
		canBlock: true,
		canTransport: true,
		canVisit: true
	};

	public priority = NightActionPriority.CONSIG;

	public async tearDown(actions: NightActionsManager, target: Player) {
		await this.player.user.send(`Your targets role is: ${target.role.display}`);
	}

}

export default MafiaRole(Consigliere);
