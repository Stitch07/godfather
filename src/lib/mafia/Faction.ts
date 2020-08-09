import Player from './Player';

class Faction {
	// whether the faction can win together, or individually
	public individual = false;
	// whether the faction is informed about their teammates
	public informed = false;
	public name = '';
	public winCondition = '';
}

interface Faction {
	hasWon(player: Player): boolean;
	hasWonIndividual(player: Player): boolean;
}

export default Faction;
