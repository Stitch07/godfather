import JuggernautFaction from '@mafia/factions/neutral/Juggernaut';
import NightActionsManager, { Attack, Defence, NightActionPriority } from '@mafia/managers/NightActionsManager';
import Killer from '@mafia/mixins/Killer';
import type Player from '@mafia/structures/Player';

class Juggernaut extends Killer {
  public name = 'Juggernaut';
  public faction = new JuggernautFaction();
  public action = 'assault';
  public actionGerund = 'assaulting';
  public actionText = 'assault a player';
  public actionParticiple = 'assaulted';
  public priority = NightActionPriority.KILLER;

  // level 1 lets them attack every night, level 2 lets them rampage, ands level 3 gives them a unstoppable attack
  public level = 0;

  public constructor(player: Player, { level }: { level?: number } = { level: 0 }) {
    super(player);
    this.level = level ?? 0;
  }

  public get defence() {
    return Defence.Basic;
  }

  public get attackStrength() {
    if (this.level === 3) return Attack.Unstoppable;
    return Attack.Powerful;
  }

  public canUseAction() {
    if (!this.canAttack()) return { check: false, reason: 'You currently can only attack on full moons.' };
    return super.canUseAction();
  }

  public get extraNightContext() {
    return `You are currently level ${this.level}`;
  }

  public runAction(actions: NightActionsManager, target: Player) {
    if (this.level >= 2) {
      const visitors = target.visitors.filter((player) => player.user.id !== this.player.user.id);
      for (const visitor of visitors) {
        if (visitor.role.actualDefence > this.attackStrength) continue;
        actions.record.setAction(visitor.user.id, 'nightkill', { result: true, by: [this.player], type: this.attackStrength });
        this.player.queueMessage('You assaulted someone who visted your target!');
        visitor.queueMessage('You were assaulted by a Juggernaut!');
      }
    }
    return super.runAction(actions, target);
  }

  public tearDown(actions: NightActionsManager, target: Player) {
    const record = actions.record.get(target.user.id).get('nightkill');
    const success = record.result && record.by.includes(this.player);
    if (!success) {
      return this.player.queueMessage('Your target was too strong to kill!');
    }
    if (this.level < 3) this.level++;
    return target.queueMessage('You were assaulted by a Juggernaut!');
  }

  private canAttack() {
    if (this.level === 0) return this.game.isFullMoon;
    return true;
  }

  public static unique = true;
}

Juggernaut.aliases = ['Jugg'];
Juggernaut.categories = [...Juggernaut.categories, 'Neutral Killing', 'Evil'];

export default Juggernaut;
