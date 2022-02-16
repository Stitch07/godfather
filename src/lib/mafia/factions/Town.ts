import Faction from "#mafia/structures/Faction";
import type { Player } from "#mafia/structures/Player";

const OPPOSING_FACTIONS = [
  "Mafia",
  "Serial Killer",
  "Arsonist",
  "Werewolf",
  "Juggernaut",
  "Cult",
];

export default class TownFaction extends Faction {
  public name = "Town";

  public winCondition = "Eliminate every evildoer.";

  public hasWon(player: Player<any>): boolean {
    // source: https://town-of-salem.fandom.com/wiki/Victory
    // Town Victory will occur when the Town is the last standing faction alive when all
    // members of the Mafia and Neutral Killing are dead
    const { game } = player;
    const { players } = game;

    const aliveTownies = players.filter(
      (player) => player.isAlive && player.role.faction.name === this.name
    );
    const aliveOpposing = players.filter(
      (player) =>
        player.isAlive && OPPOSING_FACTIONS.includes(player.role.faction.name)
    );

    return aliveTownies.length > 0 && aliveOpposing.length === 0;
  }
}
