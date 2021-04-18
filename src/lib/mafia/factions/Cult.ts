import Faction from '@mafia/structures/Faction';
import type Game from '@mafia/structures/Game';

const SUPPORTING_FACTIONS = ['Witch', 'Survivor', 'Cult'];

export default class CultFaction extends Faction {
	public name = 'Cult';
	public winCondition = 'game/factions:cultWinCondition';
	public informed = true;

	public hasWon(game: Game) {
		const aliveOpposing = game.players.filter((player) => player.isAlive && !SUPPORTING_FACTIONS.includes(player.role.faction.name)).length;
		const aliveFactional = game.players.filter((player) => player.isAlive && player.role.faction.name === 'Cult').length;
		const alivePlayers = game.players.filter((player) => player.isAlive);

		// if the Cult has a majority and nothing can stop them from converting everyone and winning, auto-win
		if (aliveFactional >= alivePlayers.length / 2 && !alivePlayers.some((player) => INFLUENCING_ROLES.includes(player.role.name))) return true;

		return aliveOpposing === 0 && aliveFactional > 0;
	}
}

// Roles that do not guarantee a cult with the majority converting everyone successfully
const INFLUENCING_ROLES = [
	// all killing roles
	'Godfather',
	'Goon',
	'Vigilante',
	'Veteran',
	'Ambusher',
	'Arsonist',
	'Jester',
	'Juggernaut',
	'Serial Killer',
	'Werewolf',
	'Bodyguard',
	'Crusader',
	'Retributionist',
	'Mayor',
	'Super Saint',
	'Transporter',
	'Jester'
];
