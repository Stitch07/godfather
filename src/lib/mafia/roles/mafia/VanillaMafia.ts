import MafiaRole from "#mafia/roles/mixins/MafiaRole";
import Role from "#mafia/structures/Role";

class VanillaMafia extends Role {
  public name = "Vanilla";

  public description =
    "You have no night actions. Your vote is your only power.";
}

export default MafiaRole(VanillaMafia);
