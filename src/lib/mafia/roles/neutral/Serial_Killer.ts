import SerialKillerFaction from '@mafia/factions/neutral/SerialKiller';
import { Defence } from '@mafia/managers/NightActionsManager';
import Killer from '@mafia/mixins/Killer';

export default class Serial_Killer extends Killer {
  public name = 'Serial Killer';
  public description = 'You may stab someone every night.';
  public faction = new SerialKillerFaction();
  public action = 'stab';
  public actionGerund = 'stabbing';
  public actionText = 'stab a player';
  public actionParticiple = 'stabbed';

  public get defence() {
    return Defence.Basic;
  }
}

Serial_Killer.aliases = ['SK'];
Serial_Killer.categories = [...Serial_Killer.categories, 'Neutral Killing', 'Evil'];
