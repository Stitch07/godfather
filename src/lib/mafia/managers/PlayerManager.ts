import type { Game } from "#lib/mafia/structures/Game";
import type { Player } from "#lib/mafia/structures/Player";

export class PlayerManager<
  PlayerClass extends Player<UserType>,
  UserType extends { id: string }
> extends Array<PlayerClass> {
  public constructor(public game: Game<PlayerClass, UserType>) {
    super();
  }

  public get(user: UserType): Player<UserType> | undefined {
    return this.find((player) => player.user === user);
  }

  public add(user: UserType) {
    this.push(this.game.makePlayer(user));
  }
}
