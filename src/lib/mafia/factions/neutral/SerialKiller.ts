import Faction from '@mafia/structures/Faction';
import type Game from '@mafia/structures/Game';

const OPPOSING_FACTIONS = ['Town', 'Arsonist', 'Werewolf', 'Mafia', 'Juggernaut'];

export default class SerialKillerFaction extends Faction {
	public name = 'Serial Killer';
	public winCondition = 'Kill everyone who would oppose you.';

	public hasWon(game: Game) {
		const { players } = game;

		const aliveSerialKillers = players.filter((player) => player.isAlive && player.role.faction.name === 'Serial Killer');
		const aliveOpposing = players.filter((player) => player.isAlive && OPPOSING_FACTIONS.includes(player.role!.faction.name));

		return aliveSerialKillers.length > 0 && aliveOpposing.length === 0;
	}
}
