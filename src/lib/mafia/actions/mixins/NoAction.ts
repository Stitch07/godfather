import { NightAction, ZeroOrMultiplePlayers } from '../../managers/NightAction';
import type NightActionsManager from '../../managers/NightActionsManager';
import type { CanUseActionData } from '../../structures/ActionRole';
import type Game from '../../structures/Game';

export class NoAction extends NightAction {
	public canUse(target: ZeroOrMultiplePlayers): CanUseActionData {
		return { check: true, reason: '' };
	}

	public confirmation(target: ZeroOrMultiplePlayers): string {
		return '';
	}

	public getTarget(args: string[], game: Game): ZeroOrMultiplePlayers {
		return null;
	}

	public setUp(actions: NightActionsManager, target: ZeroOrMultiplePlayers) {
		// noop
	}

	public runAction(actions: NightActionsManager, target: ZeroOrMultiplePlayers) {
		// noop
	}

	public tearDown(actions: NightActionsManager, target: ZeroOrMultiplePlayers) {
		// noop
	}

	public runDayCommand(actions: NightActionsManager) {
		// noop
	}

	public actionPrompt(): string {
		return '';
	}
}
