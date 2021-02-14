import type Executioner from '@mafia/roles/neutral/Executioner';
import Faction from '@mafia/structures/Faction';
import type Player from '@mafia/structures/Player';
import { cast } from '@util/utils';

export default class ExecutionerFaction extends Faction {
	public name = 'Executioner';
	public winCondition = 'game/factions:executionerWinCondition';
	public independent = true;

	public hasWonIndependent(player: Player) {
		const { target } = cast<Executioner>(player.role);
		// a player has died if they are currently dead, or they were revived
		const isDead = !target.isAlive || target.flags.isRevived;
		// The exe was successful if the target was eliminated, however - retributionists clear
		// death reasons, so there's no way to check if the revived target was previously eliminated
		// If the target died at night, the Exe should become a Jester and never reach this code,
		// so we can assume that a revived target is a eliminated target
		const eliminationSuccessful = target.isAlive ? target.flags.isRevived : target.deathReason.includes('eliminated');
		return isDead && eliminationSuccessful;
	}
}
