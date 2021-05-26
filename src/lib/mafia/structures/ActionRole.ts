import { PREFIX } from '@root/config';
import { DEFAULT_ACTION_FLAGS } from '@root/lib/constants';
import { removeArrayItem } from '@root/lib/util/utils';
import type { Message } from 'discord.js';
import { NoAction } from '../actions/mixins/NoAction';
import type { NightAction } from '../managers/NightAction';
import { NightActionEntry, NightActionPriority } from '../managers/NightActionsManager';
import { Phase } from './Game';
import Role from './Role';

export interface CanUseActionData {
	check: boolean;
	reason?: string;
}

export class ActionRole extends Role {
	public actions: NightAction[] = [];

	public actionPhase = Phase.Night;

	public onNight() {
		const actionTexts = this.actions.map((action) => `${PREFIX}${action.name} → ${action.actionText}`);
		actionTexts.push(`${PREFIX}noaction → ${this.game.t('game/players:actionNoAction')}`);
		actionTexts.push(`${PREFIX}cancel → ${this.game.t('game/players:actionCancelled')}`);
		const contexts = this.actions
			.map((action) => action.extraNightContext)
			.filter((ctx) => ctx !== null)
			.join('\n');

		return this.player.user.send(
			this.game.t('game/players:actionPm', {
				cycle: this.game.cycle,
				actions: actionTexts.join('\n'),
				contexts,
				playerlist: this.game.players.show({ codeblock: true })
			})
		);
	}

	public async onPmCommand(_message: Message, command: string, ...args: string[]): Promise<any> {
		if ((this.actionPhase & this.game.phase) !== this.game.phase) return;
		removeArrayItem(this.game.nightActions, (action) => action.actor === this.player);

		switch (command) {
			case 'cancel': {
				return this.player.user.send(this.game.t('roles/global:actionCancelled'));
			}

			case 'noaction': {
				await this.player.user.send(this.game.t('roles/global:noAction'));
				return this.game.nightActions.addAction({
					action: new NoAction(this.player.role as ActionRole),
					actor: this.player,
					priority: 0,
					target: undefined
				});
			}

			default: {
				let { check, reason } = this.canUseAction(command);
				if (!check) throw this.game.t('roles/global:actionBlocked', { reason });

				const action = this.actions.find((action) => action.name === command);
				if (!action) return;

				let target = undefined;
				if (Reflect.has(action, 'getTarget')) {
					target = action.getTarget(args, this.game);
					({ check, reason } = action.canUse(target));
					if (!check) {
						throw this.game.t('roles/global:actionBlockedTarget', {
							target: (Array.isArray(target) ? target : [target]).map((player) => player.user.username),
							reason
						});
					}
				}
				if (this.name === 'Godfather' && this.game.players.some((player) => player.isAlive && player.role.name === 'Goon')) {
					// first we remove any older action the goon had
					this.game.nightActions.splice(
						this.game.nightActions.findIndex((action) => action.actor.role.name === 'Goon'),
						1
					);
					// the Godfather also orders his Goon to kill
					await this.game.nightActions.addAction({
						action: (this.game.players.find((player) => player.isAlive && player.role.name === 'Goon')!.role as ActionRole).actions[0],
						actor: this.game.players.find((pl) => pl.role.name === 'Goon')!,
						target,
						priority: NightActionPriority.KILLER,
						flags: DEFAULT_ACTION_FLAGS
					});
				}

				await this.player.user.send(action.confirmation(target));
				await this.player.game.nightActions.addAction({
					action,
					actor: this.player,
					target,
					priority: action.priority,
					flags: action.flags ?? DEFAULT_ACTION_FLAGS
				});
			}
		}
	}

	public canUseAction(_command?: string): CanUseActionData {
		return { check: this.player.isAlive, reason: '' };
	}

	// eslint-disable-next-line @typescript-eslint/class-literal-property-style
	public get defaultAction(): NightActionEntry | null {
		return null;
	}
}
