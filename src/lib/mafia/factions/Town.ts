import Faction from '#mafia/structures/Faction';
import Game from '../structures/Game';

const OPPOSING_FACTIONS = ['Mafia', 'Serial Killer', 'Arsonist', 'Werewolf', 'Juggernaut'];

export default class TownFaction extends Faction {

	public name = 'Town';

	public winCondition = 'Lynch every evildoer.';

	public hasWon(game: Game): boolean {
		// source: https://town-of-salem.fandom.com/wiki/Victory
		// Town Victory will occur when the Town is the last standing faction alive when all members of the Mafia,
		// Neutral Killing are dead
		const { players } = game;

		const aliveTownies = players.filter(player => player.isAlive && player.role!.faction.name === this.name);
		const aliveOpposing = players.filter(player => player.isAlive && OPPOSING_FACTIONS.includes(player.role!.faction.name));

		return aliveTownies.length > 0 && aliveOpposing.length === 0;
	}

}
