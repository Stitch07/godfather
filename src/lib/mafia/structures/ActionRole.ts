import { DEFAULT_ACTION_FLAGS } from '@root/lib/constants';
import { removeArrayItem } from '@root/lib/util/utils';
import type { Message } from 'discord.js';
import { NoAction } from '../actions/mixins/NoAction';
import type { NightAction } from '../managers/NightAction';
import type { NightActionEntry } from '../managers/NightActionsManager';
import { Phase } from './Game';
import Role from './Role';

export interface CanUseActionData {
	check: boolean;
	reason?: string;
}

export class ActionRole extends Role {
	public actions: NightAction[] = [];

	public actionPhase = Phase.Night;

	public async onPmCommand(message: Message, command: string, ...args: string[]): Promise<any> {
		if ((this.actionPhase & this.game.phase) !== this.game.phase) return;
		removeArrayItem(this.game.nightActions, (action) => action.actor === this.player);

		switch (command) {
			case 'cancel': {
				return this.player.user.send(this.game.t('roles/global:actionCancelled'));
			}

			case 'noaction': {
				await this.player.user.send(this.game.t('roles/global:noAction'));
				return this.game.nightActions.addAction({
					action: new NoAction(),
					actor: this.player,
					priority: this.priority,
					target: null
				});
			}

			default: {
				let { check, reason } = this.canUseAction(command);
				if (!check) throw this.game.t('roles/global:actionBlocked', { reason });

				const action = this.actions.find((action) => action.name === command);
				if (!action) return;

				const target = action.getTarget(args, this.game);
				({ check, reason } = action.canUse(target));
				if (!check) {
					throw this.game.t('roles/global:actionBlockedTarget', {
						target: Array.isArray(target) ? target : [target]
					});
				}

				await this.player.user.send(action.confirmation(target));
				await this.player.game.nightActions.addAction({
					action,
					actor: this.player,
					target,
					priority: this.priority,
					flags: this.flags ?? DEFAULT_ACTION_FLAGS
				});
			}
		}
	}

	public canUseAction(command?: string): CanUseActionData {
		return { check: this.player.isAlive, reason: '' };
	}

	// eslint-disable-next-line @typescript-eslint/class-literal-property-style
	public get defaultAction(): NightActionEntry | null {
		return null;
	}
}
