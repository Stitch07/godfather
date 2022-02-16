import type Faction from "#lib/mafia/structures/Faction";

const INNOCENT_FACTIONS = [
  "Town",
  "Survivor",
  "Jester",
  "Amnesiac",
  "Guardian Angel",
  "Juggernaut",
  "Godfather",
  "Executioner",
];

class Role {
  public name = "";
  public description = "";

  public get innocence() {
    return INNOCENT_FACTIONS.includes(this.faction.name);
  }

  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  // ESLint complains that this shouldn't be a getter, but it won't be constant for roles such as
  // Mayor
  public readonly voteWeight = 1;

  public onDeath() {
    // noop
  }
}

interface Role {
  faction: Faction;
}

export default Role;
