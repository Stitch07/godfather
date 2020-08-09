import ActionRole from '@mafia/mixins/ActionRole'
import NightActionsManager, { NightActionPriority, NightActionCommand } from '@mafia/managers/NightActionsManager'
import TownFaction from '@mafia/factions/Town';
import Player from '@mafia/Player';

class AlignmentCop extends ActionRole {
    public name = 'Alignment Cop';
    public static documentation = 'Roleinfo docs here.';

    public action = NightActionCommand.CHECK;
    public actionGerund = 'checking';
    public actionText = 'check a player';
    public flags = {
        canBlock: true,
        canTransport: true,
        canVisit: true
    };
    public priority = NightActionPriority.COP;
    public faction = new TownFaction();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async tearDown(actions: NightActionsManager, target?: Player) {
        let resultText = "Your target is ";
		if (target?.isInnocent) {
            resultText += "not ";
        }
        resultText += "suspicious.";
        await this.player.user.sendMessage(resultText);
	}
}

AlignmentCop.categories.push('Town Investigative');
AlignmentCop.categories.push('Random Town');

export default AlignmentCop;