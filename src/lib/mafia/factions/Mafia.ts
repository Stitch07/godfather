import Faction from '@mafia/structures/Faction';
import type Game from '@mafia/structures/Game';
import type Player from '@mafia/structures/Player';
import { ActionRole } from '../structures/ActionRole';

const WINS_WITH = ['Mafia', 'Survivor', 'Witch'];

const filterOpposingPowerRoles = (player: Player) =>
	(player.isAlive && !WINS_WITH.includes(player.role!.faction.name) && player.role instanceof ActionRole && player.role.canUseAction().check) ||
	player.role.name === 'Mayor';

export default class MafiaFaction extends Faction {
	public name = 'Mafia';

	public winCondition = 'game/factions:mafiaWinCondition';

	public informed = true;

	public hasWon(game: Game) {
		// source: https://town-of-salem.fandom.com/wiki/Victory
		// The Mafia need at least one member alive, and all opposing factions dead
		const { players } = game;

		const aliveMafia = players.filter((player) => player.isAlive && player.role!.faction.name === 'Mafia');
		const aliveOpposingPrs = players.filter(filterOpposingPowerRoles);
		const aliveOpposing = players.filter((player) => player.isAlive && !WINS_WITH.includes(player.role!.faction.name));

		return aliveMafia.length > 0 && aliveMafia.length >= aliveOpposing.length && aliveOpposingPrs.length === 0;
	}
}
