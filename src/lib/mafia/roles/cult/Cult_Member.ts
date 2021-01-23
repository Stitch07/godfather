import CultFaction from '@mafia/factions/Cult';
import Role from '@mafia/structures/Role';

class CultMember extends Role {
  public name = 'Cult Member';
  public description = 'You have no night action.';
  public faction = new CultFaction();
}

CultMember.aliases = ['CM'];

export default CultMember;
