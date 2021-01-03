import Faction from '@mafia/structures/Faction';
import Game from '@mafia/structures/Game';

const OPPOSING_FACTIONS = ['Town', 'Serial Killer', 'Werewolf', 'Mafia', 'Juggernaut'];

export default class ArsonistFaction extends Faction {

	public name = 'Arsonist';
	public winCondition = 'Kill everyone who would oppose you.';

	public hasWon(game: Game) {
		const { players } = game;

		const aliveArsonists = players.filter(player => player.isAlive && player.role.faction.name === 'Arsonist');
		const aliveOpposing = players.filter(player => player.isAlive && OPPOSING_FACTIONS.includes(player.role!.faction.name));

		return aliveArsonists.length > 0 && aliveOpposing.length === 0;
	}

}
