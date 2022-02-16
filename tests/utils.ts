import { Game } from "../src/lib/mafia/structures/Game";
import { Player } from "../src/lib/mafia/structures/Player";

interface TestUser {
  id: string;
}

export class TestPlayer extends Player<TestUser> {
  public constructor(game: TestGame, name: TestUser) {
    super(game, { id: name.id });
  }
}

export class TestGame extends Game<TestPlayer, TestUser> {
  public makePlayer(user: TestUser): TestPlayer {
    return new TestPlayer(this, user);
  }
}
