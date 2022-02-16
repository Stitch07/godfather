import TownFaction from "#mafia/factions/Town";
import type Role from "#mafia/structures/Role";

export default function Townie<TBaseRole extends typeof Role>(
  BaseRole: TBaseRole
) {
  // @ts-ignore A constructor isn't necessary here
  class Townie extends BaseRole {
    public faction = new TownFaction();
  }

  return Townie;
}
