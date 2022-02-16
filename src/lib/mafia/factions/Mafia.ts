import Faction from "#mafia/structures/Faction";
import type { Player } from "#mafia/structures/Player";

const OPPOSING_FACTIONS = [
  "Town",
  "Arsonist",
  "Werewolf",
  "Serial Killer",
  "Juggernaut",
];
// TODO: Add Mayor check here after adding night actions
const filterOpposingPowerRoles = (player: Player<any>) =>
  player.isAlive && OPPOSING_FACTIONS.includes(player.role!.faction.name);

export default class MafiaFaction extends Faction {
  public name = "Mafia";

  public winCondition = "Kill all townies and competing evil factions.";

  public informed = true;

  public hasWon(player: Player<any>) {
    // source: https://town-of-salem.fandom.com/wiki/Victory
    // The Mafia need at least one member alive, and all opposing factions dead
    const { players } = player.game;

    const aliveMafia = players.filter(
      (player) => player.isAlive && player.role!.faction.name === "Mafia"
    );
    const aliveOpposingPrs = players.filter(filterOpposingPowerRoles);
    const aliveOpposing = players.filter(
      (player) =>
        player.isAlive && OPPOSING_FACTIONS.includes(player.role!.faction.name)
    );

    return (
      aliveMafia.length > 0 &&
      aliveMafia.length >= aliveOpposing.length &&
      aliveOpposingPrs.length === 0
    );
  }
}
