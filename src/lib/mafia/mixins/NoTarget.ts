import { DEFAULT_ACTION_FLAGS } from '@lib/constants';
// @ts-expect-error (1371) Bypass not being able to type import default and named
import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import { Phase } from '@mafia/structures/Game';
import Role from '@mafia/structures/Role';
import { PREFIX } from '@root/config';
import type { Awaited } from '@sapphire/framework';
import { removeArrayItem } from '@util/utils';
import type { Message } from 'discord.js';

class NoTarget extends Role {
	public actionPhase = Phase.Night;

	public async onNight() {
		const { game } = this.player;
		const actionText = [
			game.t('roles/global:nightActionPromptNoTarget', {
				prefix: PREFIX,
				cycle: game.cycle,
				action: this.action,
				actionText: this.actionText
			}),
			this.extraNightContext
		]
			.filter((text) => text !== null)
			.join('\n');
		await this.player.user.send(actionText);
	}

	public async onPmCommand(message: Message, command: string) {
		// day commands use a completely different action flow
		const { check, reason } = this.canUseAction();
		if (!check) throw this.game.t('roles/global:actionBlocked', { reason });

		if (!this.possibleActions.includes(command)) return;

		removeArrayItem(this.game.nightActions, (action) => action.actor === this.player);

		switch (command) {
			case 'cancel':
				return this.player.user.send(this.game.t('roles/global:actionCancelled'));
			case 'noaction': {
				await this.game.nightActions.addAction({
					action: undefined,
					actor: this.player,
					priority: this.priority
				});
				return this.player.user.send(this.game.t('roles/global:noAction'));
			}
			default:
				await this.player.game.nightActions.addAction({
					action: this.action,
					actor: this.player,
					priority: this.priority,
					flags: this.flags ?? DEFAULT_ACTION_FLAGS
				});
		}

		return this.player.user.send(this.game.t('roles/global:noTargetConfirmation', { gerund: this.actionGerund }));
	}

	private get possibleActions() {
		return [this.action, 'noaction'];
	}

	public canUseAction() {
		return { check: true, reason: '' };
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public setUp(actions: NightActionsManager): Awaited<any> {
		// noop
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public runAction(actions: NightActionsManager): Awaited<any> {
		// noop
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public tearDown(actions: NightActionsManager): Awaited<any> {
		// noop
	}

	// eslint-disable-next-line @typescript-eslint/class-literal-property-style
	public get extraNightContext(): string | null {
		return null;
	}
}

interface NoTarget {
	action: string;
	actionGerund: string;
	actionText: string;
	flags?: {
		canBlock: boolean;
		canTransport: boolean;
		canVisit: boolean;
	};
	priority: NightActionPriority;
}

export default NoTarget;
