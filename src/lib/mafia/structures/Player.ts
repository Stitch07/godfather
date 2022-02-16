import type { Game } from "#mafia/structures/Game";
import type Role from "#mafia/structures/Role";

/**
 * Represents a base Player class with no Discord related contextual information, that will be added
 * by an extension class. In unit tests, UserType is a simple JS object, in Discord related code,
 * it'll be a discordjs.User instance
 */
export class Player<UserType extends { id: string }> {
  public role!: Role;
  public isAlive = true;
  public deathReason = "";

  public constructor(
    public game: Game<Player<UserType>, UserType>,
    public user: UserType
  ) {}

  public kill(deathReason: string) {
    this.isAlive = false;
    this.deathReason = deathReason;

    this.role.onDeath(this);
  }
}
