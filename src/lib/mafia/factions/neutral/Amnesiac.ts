import Faction from '@mafia/Faction';

export default class AmnesiacFaction extends Faction {

	public name = 'Amnesiac';
	public winCondition = 'Remember a role and satisfy its win condition.';
	public independent = true;

	public hasWonIndependent() {
		return false;
	}

}
