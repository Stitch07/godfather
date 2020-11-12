import Faction from '@mafia/Faction';
import Player from '@mafia/Player';
import Game from '../../Game';

const OPPOSING_FACTIONS = ['Town', 'Arsonist', 'Mafia'];
const filterOpposingPowerRoles = (player: Player) => player.isAlive && OPPOSING_FACTIONS.includes(player.role!.faction.name) && player.role!.canUseAction().check;

export default class SerialKillerFaction extends Faction {

	public name = 'Serial Killer';
	public winCondition = 'Kill everyone who would oppose you.';

	public hasWon(game: Game) {
		const { players } = game;

		const aliveSerialKillers = players.filter(player => player.isAlive && player.role!.faction.name === 'Serial Killer');
		const aliveOpposingPrs = players.filter(filterOpposingPowerRoles);
		const aliveOpposing = players.filter(player => player.isAlive && OPPOSING_FACTIONS.includes(player.role!.faction.name));

		return aliveSerialKillers.length > 0
			&& aliveSerialKillers.length >= aliveOpposing.length
			&& aliveOpposingPrs.length === 0;
	}

}
