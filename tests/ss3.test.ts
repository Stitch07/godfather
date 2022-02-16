import VanillaMafia from "#mafia/roles/mafia/VanillaMafia";
import SuperSaint from "#mafia/roles/town/SuperSaint";
import Vanilla from "#mafia/roles/town/Vanilla";
import { Phase } from "#mafia/structures/Game";
import type Role from "#mafia/structures/Role";
import { TestGame } from "./utils";

test("ss3 with town win", () => {
  const game = new TestGame({ id: "Host" });
  const setup = [new Vanilla(), new VanillaMafia(), new SuperSaint()] as Role[];
  game.players.add({ id: "Player 1" });
  game.players.add({ id: "Player 2" });

  expect(game.hasStarted).toBe(false);

  game.setup(setup);
  game.startDay();

  expect(game.phase).toBe(Phase.Day);
  expect(game.hasStarted).toBe(true);

  // Voting
  expect(game.votes.vote(game.players[0], game.players[1])).toBe(false);
  // 2 votes on the VanillaMafia are a successful hammer
  expect(game.votes.vote(game.players[2], game.players[1])).toBe(true);
  game.players[1].kill("Hammered D1");
  expect(game.players[1].isAlive).toBe(false);
  // Town wins!
  const { winningFaction } = game.checkEndgame();
  expect(winningFaction?.name).toBe("Town");
});

test("ss3 with super saint hammered", () => {
  const game = new TestGame({ id: "Host" });
  const setup = [new Vanilla(), new VanillaMafia(), new SuperSaint()] as Role[];
  game.players.add({ id: "Player 1" });
  game.players.add({ id: "Player 2" });

  game.setup(setup);
  game.startDay();

  // Voting
  expect(game.votes.vote(game.players[0], game.players[2])).toBe(false);
  expect(game.votes.vote(game.players[1], game.players[2])).toBe(true);
  game.players[2].kill("eliminated D1");

  // The Super Saint should blow up Player 1
  expect(game.players[1].isAlive).toBe(false);
  // Town wins, as the VM got blown up
  expect(game.checkEndgame().hasEnded).toBe(true);
  expect(game.checkEndgame().winningFaction?.name).toBe("Town");
});
