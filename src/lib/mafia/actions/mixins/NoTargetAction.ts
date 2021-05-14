import { NightAction } from '../../managers/NightAction';
import type NightActionsManager from '../../managers/NightActionsManager';
import type { CanUseActionData } from '../../structures/ActionRole';

export class NoTargetAction extends NightAction {
	public canUse(): CanUseActionData {
		return { check: true, reason: '' };
	}

	public confirmation(): string {
		return `You are ${this.actionGerund} tonight.`;
	}

	public setUp(actions: NightActionsManager) {
		// noop
	}

	public runAction(actions: NightActionsManager) {
		// noop
	}

	public tearDown(actions: NightActionsManager) {
		// noop
	}

	public runDayCommand(actions: NightActionsManager) {
		// noop
	}

	public actionPrompt(): string {
		return '';
	}
}
