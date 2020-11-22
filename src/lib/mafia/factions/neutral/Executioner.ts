import Faction from '@mafia/Faction';
import Player from '@mafia/Player';
import Executioner from '@mafia/roles/neutral/Executioner';
import { cast } from '@util/utils';

export default class ExecutionerFaction extends Faction {

	public name = 'Executioner';
	public winCondition = 'Lynch your target at all costs.';
	public independent = true;

	public hasWonIndependent(player: Player) {
		const { target } = cast<Executioner>(player.role);
		// a player has died if they are currently dead, or they were revived
		const isDead = !target.isAlive || target.flags.isRevived;
		// The exe was successful if the target was lynched, however - retributionists clear
		// death reasons, so there's no way to check if the revived target was previously lynched
		// If the target died at night, the Exe should become a Jester and never reach this code,
		// so we can assume that a revived target is a lynched target
		const lynchSuccessful = target.isAlive ? target.flags.isRevived : target.deathReason.includes('lynched');
		return isDead && lynchSuccessful;
	}

}
