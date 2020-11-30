import Faction from '@mafia/Faction';
import Player from '@mafia/Player';
import Game from '@mafia/Game';

const OPPOSING_FACTIONS = ['Town', 'Arsonist', 'Werewolf', 'Serial Killer'];
const filterOpposingPowerRoles = (player: Player) => player.isAlive && OPPOSING_FACTIONS.includes(player.role!.faction.name) && (player.role!.canUseAction().check || player.role.name === 'Mayor');

export default class MafiaFaction extends Faction {

	public name = 'Mafia';

	public winCondition = 'Kill all townies and competing evil factions.';

	public informed = true;

	public hasWon(game: Game) {
		// source: https://town-of-salem.fandom.com/wiki/Victory
		// The Mafia need at least one member alive, and all opposing factions dead
		const { players } = game;

		const aliveMafia = players.filter(player => player.isAlive && player.role!.faction.name === 'Mafia');
		const aliveOpposingPrs = players.filter(filterOpposingPowerRoles);
		const aliveOpposing = players.filter(player => player.isAlive && OPPOSING_FACTIONS.includes(player.role!.faction.name));

		return aliveMafia.length > 0
			&& aliveMafia.length >= aliveOpposing.length
			&& aliveOpposingPrs.length === 0;
	}

}
