import { NightAction } from '../../managers/NightAction';
import type NightActionsManager from '../../managers/NightActionsManager';

export class NoTargetAction extends NightAction {
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
