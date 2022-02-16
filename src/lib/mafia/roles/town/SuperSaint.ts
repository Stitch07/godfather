import Townie from "#mafia/roles/mixins/Townie";
import type { Player } from "#mafia/structures/Player";
import Role from "#mafia/structures/Role";

class SuperSaint extends Role {
  public name = "Super Saint";
  public description = "If eliminated, you kill the last person voting you.";

  public onDeath(player: Player<any>) {
    if (player.deathReason.startsWith("eliminated")) {
      const { game } = player;

      const votesOnSaint = game.votes.on(player);
      const { by: lastVoter } = votesOnSaint!.slice().pop()!;

      lastVoter.kill("blown up by Super Saint");
    }

    return super.onDeath(player);
  }
}

export default Townie(SuperSaint);
