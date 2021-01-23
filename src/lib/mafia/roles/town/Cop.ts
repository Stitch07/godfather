import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import SingleTarget from '@mafia/mixins/SingleTarget';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';

class Cop extends SingleTarget {
  public name = 'Cop';

  public action = 'check';
  public actionGerund = 'checking';
  public actionText = 'check a player';

  public priority = NightActionPriority.COP;

  // ensures that Dethy cops don't get PMed their real role
  public get display(): string {
    if (this.player.cleaned && !this.player.isAlive) return 'Cleaned';
    return 'Cop';
  }

  public async tearDown(actions: NightActionsManager, target: Player) {
    let innocence = this.innocenceModifier(target.role.modifiers.innocence ?? target.role.innocence);
    if (actions.framedPlayers.includes(target)) {
      innocence = !innocence;
      actions.framedPlayers.splice(actions.framedPlayers.indexOf(target), 1);
    }
    await this.player.queueMessage(innocence ? 'Your target is innocent.' : 'Your target is suspicious.');
  }

  public innocenceModifier(innocence: boolean) {
    // dethy cops can use this
    return innocence;
  }
}

Cop.categories = [...Cop.categories, 'Town Investigative'];

export default Townie(Cop);
