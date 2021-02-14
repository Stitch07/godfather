import Faction from '@mafia/structures/Faction';
import type Player from '@mafia/structures/Player';

export default class JesterFaction extends Faction {
	public name = 'Jester';
	public winCondition = 'game/factions:jesterWinCondition';
	public independent = true;

	public hasWonIndependent(player: Player) {
		return !player.isAlive && player.deathReason.includes('eliminated');
	}
}
