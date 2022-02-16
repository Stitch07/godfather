import MafiaFaction from "#mafia/factions/Mafia";
import type Role from "#mafia/structures/Role";

export default function MafiaRole<TBaseRole extends typeof Role>(
  BaseRole: TBaseRole
) {
  // @ts-ignore A constructor isn't necessary here
  class MafiaRole extends BaseRole {
    public faction = new MafiaFaction();
  }

  return MafiaRole;
}
