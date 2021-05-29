import Faction from '@mafia/structures/Faction';
import type Player from '@mafia/structures/Player';

export default class SurvivorFaction extends Faction {
	public name = 'Survivor';
	public winCondition = 'game/factions:survivorWinCondition';
	public independent = true;

	public hasWonIndependent(player: Player) {
		return player.isAlive;
	}
}
