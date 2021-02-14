import Faction from '@mafia/structures/Faction';

export default class AmnesiacFaction extends Faction {
	public name = 'Amnesiac';
	public winCondition = 'game/factions:amnesiacWinCondition';
	public independent = true;

	public hasWonIndependent() {
		return false;
	}
}
