import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import SingleTarget from '@mafia/mixins/SingleTarget';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';

class Retributionist extends SingleTarget {
  public name = 'Retributionist';
  public description = 'You may revive a dead Townie at night.';
  public action = 'revive';
  public actionText = 'revive a player';
  public actionGerund = 'reviving';
  public priority = NightActionPriority.RETRIBUTIONIST;
  public flags = {
    canTransport: false,
    canVisit: false,
    canWitch: false
  };

  // whether the Ret has already revived a player
  private hasRevived = false;

  public async tearDown(actions: NightActionsManager, target: Player) {
    target.isAlive = true;
    target.deathReason = '';
    target.flags.isRevived = true;
    target.flags.revivedOn = this.game.cycle;
    this.hasRevived = true;
    await this.game.channel.send(`${target} was resurrected back to life!`);
    await target.queueMessage('You were revived by a Retributionist!');

    if (target.role.name === 'Vigilante') {
      Reflect.set(target.role, 'guilty', true);
    }

    if (this.game.canOverwritePermissions) {
      const overwrite = this.game.channel.permissionOverwrites.find((permission) => permission.type === 'member' && permission.id === target.user.id);
      if (overwrite) await overwrite.update({ SEND_MESSAGES: true, ADD_REACTIONS: true });
    }
  }

  public canUseAction() {
    if (this.hasRevived) return { check: false, reason: 'You have already revived a player.' };
    const validTargets = this.game.players.filter((target) => this.canTarget(target).check);
    if (validTargets.length === 0) return { check: false, reason: 'There are no valid targets.' };
    return { check: true, reason: '' };
  }

  public canTarget(target: Player) {
    if (target.isAlive || target.role.faction.name !== 'Town') return { check: false, reason: 'You can only target dead Townies.' };
    if (target.cleaned) return { check: false, reason: 'You cannot revive cleaned players.' };
    // @ts-ignore tsc cannot detect static properties
    if (target.role.constructor.unique) return { check: false, reason: 'You cannot revive unique roles.' };
    return { check: true, reason: '' };
  }

  public static unique = true;
}

Retributionist.categories = [...Retributionist.categories, 'Town Support'];
Retributionist.aliases = ['Ret', 'Retri'];

export default Townie(Retributionist);
