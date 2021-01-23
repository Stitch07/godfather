import NightActionsManager, { Attack, NightActionPriority } from '@mafia/managers/NightActionsManager';
import SingleTarget from '@mafia/mixins/SingleTarget';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';
import { randomArray } from '@root/lib/util/utils';

class Crusader extends SingleTarget {
  public name = 'Crusader';
  public description = 'You may protect someone every night, attacking one randomly selected visitor if your target is visited.';
  public action = 'protect';
  public actionText = 'protect a player';
  public actionGerund = 'protecting';
  public priority = NightActionPriority.CRUSADER;
  private isTargetAttacked = false;

  public runAction(actions: NightActionsManager, target: Player) {
    const playerRecord = actions.record.get(target.user.id);
    if (playerRecord.size === 0) {
      return;
    }

    // Select visitor to be killed.
    const visitors = target.visitors.filter((player) => player.user.id !== this.player.user.id);
    const playerToKill = randomArray(visitors)!;

    // Block all nightkills.
    const nightKills = playerRecord.get('nightkill');
    if (nightKills && nightKills.result && nightKills.type && nightKills.type < Attack.Unstoppable) {
      this.isTargetAttacked = true;
      playerRecord.set('nightkill', { result: false, by: [] });
    }

    const protects = playerRecord.get('protect');
    protects.result = true;
    protects.by.push(this.player);
    playerRecord.set('protect', protects);
    actions.record.set(target.user.id, playerRecord);

    // Kill the visitor.
    // crus only protects against CL, but doesn't attack them
    if (playerToKill.role.name === 'Cult Leader') return;
    actions.record.setAction(playerToKill.user.id, 'nightkill', { result: true, by: [this.player], type: Attack.Basic });
    playerToKill.queueMessage('You were attacked by a Crusader!');
  }

  public tearDown(actions: NightActionsManager, target: Player) {
    const record = actions.record.get(target.user.id).get('guard');
    const success = target.user.id !== this.player.user.id && record.result && record.by.includes(this.player);

    if (success && this.isTargetAttacked) {
      this.isTargetAttacked = false;
      return target.queueMessage('You were attacked but somebody fought off your attacker!');
    }
  }

  public canTarget(player: Player) {
    // TODO: customizable rule here
    if (player === this.player) return { check: false, reason: 'You cannot target yourself.' };
    return super.canTarget(player);
  }
}

Crusader.aliases = ['Crus'];
Crusader.categories = [...Crusader.categories, 'Town Protective'];

export default Townie(Crusader);
