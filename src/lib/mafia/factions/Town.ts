import Faction from '@mafia/Faction';
import Player from '@mafia/Player';

const OPPOSING_FACTIONS = ['Mafia', 'Serial Killer', 'Arsonist'];

export default class TownFaction extends Faction {

	public name = 'Town';

	public winCondition = 'Lynch every evildoer.';

	public hasWon(player: Player): boolean {
		// source: https://town-of-salem.fandom.com/wiki/Victory
		// Town Victory will occur when the Town is the last standing faction alive when all members of the Mafia,
		// Neutral Killing are dead
		const { game } = player;

		const aliveTownies = game.players.filter(player => player.role!.faction.name === this.name);
		const aliveOpposing = game.players.filter(player => OPPOSING_FACTIONS.includes(player.role!.faction.name));

		return aliveTownies.length > 0 && aliveOpposing.length === 0;
	}

}
