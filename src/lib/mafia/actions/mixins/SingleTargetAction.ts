import { NightAction } from '../../managers/NightAction';
import type NightActionsManager from '../../managers/NightActionsManager';
import type { CanUseActionData } from '../../structures/ActionRole';
import type Game from '../../structures/Game';
import Player from '../../structures/Player';

export type OneOrMultiplePlayers = Player | Player[];

export class SingleTargetAction extends NightAction {
	public canUse(target: OneOrMultiplePlayers): CanUseActionData {
		return { check: true, reason: '' };
	}

	public confirmation(target: OneOrMultiplePlayers): string {
		return '';
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
