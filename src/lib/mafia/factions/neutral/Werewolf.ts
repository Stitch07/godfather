import Faction from '@mafia/Faction';
import Game from '@mafia/Game';

const SUPPORTING_FACTIONS = ['Werewolf', 'Witch', 'Survivor'];

export default class WerewolfFaction extends Faction {

	public name = 'Werewolf';
	public winCondition = 'Kill everyone who would oppose you.';

	public hasWon(game: Game) {
		const aliveOpposing = game.players.filter(player => player.isAlive && !SUPPORTING_FACTIONS.includes(player.role.faction.name)).length;
		const aliveFactional = game.players.filter(player => player.isAlive && player.role.faction.name === 'Werewolf').length;

		return aliveOpposing === 0 && aliveFactional > 0;
	}

}
