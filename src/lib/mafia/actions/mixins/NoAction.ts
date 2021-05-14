import { NightAction, OneOrMultiplePlayers } from '../../managers/NightAction';
import type NightActionsManager from '../../managers/NightActionsManager';
import type { CanUseActionData } from '../../structures/ActionRole';

export class NoAction extends NightAction {
	public canUse(target: OneOrMultiplePlayers): CanUseActionData {
		return { check: true, reason: '' };
	}

	public confirmation(target: OneOrMultiplePlayers): string {
		return '';
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
