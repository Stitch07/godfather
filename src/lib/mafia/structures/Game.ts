import { Player } from "#lib/mafia/structures/Player";
import type { Nullable } from "#lib/util/utils";
import { PlayerManager } from "#mafia/managers/PlayerManager";
import { VoteManager } from "#mafia/managers/VoteManager";
import type Faction from "#mafia/structures/Faction";

export const enum Phase {
  Pregame,
  Standby,
  Day,
  Trial,
  TrialVoting,
  Night,
  Ended,
}

export class Game<
  PlayerClass extends Player<UserClass>,
  UserClass extends { id: string }
> {
  /**
   * The current phase of the game
   */
  public phase = Phase.Pregame;

  /**
   * The current cycle
   */
  public cycle = 0;

  public players: PlayerManager<PlayerClass, UserClass> = new PlayerManager<
    PlayerClass,
    UserClass
  >(this);

  public votes = new VoteManager(this);

  public get majorityVotes() {
    const alivePlayers = this.players.filter((player) => player.isAlive);
    return Math.floor(alivePlayers.length / 2) + 1;
  }

  public constructor(public host: UserClass) {
    this.players.push(this.makePlayer(host));
  }

  public startDay() {
    const winCheck = this.checkEndgame();
    if (winCheck.hasEnded) {
      return this.end(winCheck);
    }

    this.phase = Phase.Day;
    this.cycle++;
    this.votes.reset();
  }

  public get hasStarted() {
    return this.phase !== Phase.Pregame;
  }

  public checkEndgame(): EndgameCheckData<PlayerClass> {
    let winningFaction: Nullable<Faction> = null;
    const independentWins: PlayerClass[] = [];

    const alivePlayers = this.players.filter((player) => player.isAlive);

    for (const player of alivePlayers) {
      const win = player.role.faction.hasWon(player);
      if (win) {
        if (player.role.faction.independent) {
          independentWins.push(player);
        } else {
          winningFaction = player.role.faction;
        }
      }
    }

    // if there are no major factions left end game immediately
    const majorFactions = this.players.filter(
      (player) => player.isAlive && !player.role.faction.independent
    );
    if (majorFactions.length === 0) {
      return {
        hasEnded: true,
        winningFaction: null,
        independentWins,
      };
    }

    // draw by wipe-out
    if (alivePlayers.length === 0) {
      return {
        hasEnded: true,
        winningFaction: null,
        independentWins,
      };
    }

    return {
      hasEnded: winningFaction !== undefined,
      winningFaction,
      independentWins,
    };
  }

  public end(_data: EndgameCheckData<PlayerClass>) {
    this.phase = Phase.Ended;
  }

  public makePlayer(user: UserClass): PlayerClass {
    return new Player(this, user) as PlayerClass;
  }
}

export interface EndgameCheckData<PlayerClass> {
  hasEnded: boolean;
  winningFaction: Nullable<Faction>;
  independentWins: PlayerClass[];
}
