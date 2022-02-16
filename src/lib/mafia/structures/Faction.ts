import type { Player } from "#lib/mafia/structures/Player";

class Faction {
  /**
   * Whether the faction wins individually, or as teammates
   */
  public independent = false;
  public informed = false;
  public name = "";
  public winCondition = "";
}

interface Faction {
  hasWon(player: Player<any>): boolean;
}

export default Faction;
