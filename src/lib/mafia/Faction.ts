import Game from './Game';
import Player from './Player';

class Faction {

	// whether the faction can win together, or individually
	public independent = false;
	// whether the faction is informed about their teammates
	public informed = false;
	public name = '';
	public winCondition = '';

}

interface Faction {
	hasWon(game: Game): boolean;
	hasWonIndependent(player: Player): boolean;
}

export default Faction;
