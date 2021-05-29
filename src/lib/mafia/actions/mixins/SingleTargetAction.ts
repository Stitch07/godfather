import { listItems } from '@root/lib/util/utils';
import { NightAction } from '../../managers/NightAction';
import type NightActionsManager from '../../managers/NightActionsManager';
import type { CanUseActionData } from '../../structures/ActionRole';
import type Game from '../../structures/Game';
import Player from '../../structures/Player';

export type OneOrMultiplePlayers = Player | Player[];

export class SingleTargetAction extends NightAction {
	public canUse(target: OneOrMultiplePlayers): CanUseActionData {
		if (!(target as Player).isAlive) return { check: false, reason: this.game.t('roles/global:targetDeadPlayers') };
		if (target === this.player) return { check: false, reason: this.game.t('roles/global:targetSelf') };
		return super.canUse();
	}

	public confirmation(target: OneOrMultiplePlayers): string {
		return `You are ${this.actionGerund} ${Array.isArray(target) ? listItems(target.map((tgt) => tgt.user.username)) : target} tonight.`;
	}

	public getTarget(args: string[], game: Game): OneOrMultiplePlayers {
		const target = Player.resolve(game, args.join(' '));
		if (!target) throw game.t('roles/global:targetInvalid', { maxPlayers: game.players.length });
		return target;
	}

	public setUp(actions: NightActionsManager, target: OneOrMultiplePlayers) {
		// noop
	}

	public runAction(actions: NightActionsManager, target: OneOrMultiplePlayers) {
		// noop
	}

	public tearDown(actions: NightActionsManager, target: OneOrMultiplePlayers) {
		// noop
	}

	public runDayCommand(actions: NightActionsManager) {
		// noop
	}

	public actionPrompt(): string {
		return '';
	}
}
