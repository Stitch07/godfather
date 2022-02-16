import { TestGame } from "./utils";

test("ss3", () => {
  const game = new TestGame({ id: "Host" });
  game.players.add({ id: "Player 1" });
  game.players.add({ id: "Player 2" });

  expect(game.hasStarted).toBe(false);
});
