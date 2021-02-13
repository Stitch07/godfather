// @ts-expect-error (1371) Bypass not being able to type import default and named
import NightActionsManager, { NightAction, NightActionPriority } from '@mafia/managers/NightActionsManager';
import Game, { Phase } from '@mafia/structures/Game';
import Player from '@mafia/structures/Player';
import Role from '@mafia/structures/Role';
import { PREFIX } from '@root/config';
import { DEFAULT_ACTION_FLAGS } from '@root/lib/constants';
import { Awaited, codeBlock } from '@sapphire/utilities';
import { listItems, removeArrayItem } from '@util/utils';
import type { Message } from 'discord.js';

class SingleTarget extends Role {
	public actionPhase = Phase.Night;

	public constructor(player: Player) {
		super(player);
	}

	public async onNight() {
		const { game } = this.player;

		const actionText = [
			game.t('roles/global:nightActionPromptSingleTarget', {
				prefix: PREFIX,
				cycle: game.cycle,
				action: this.action,
				actionText: this.actionText
			}),
			this.extraNightContext,
			`${codeBlock('diff', game.players.show({ codeblock: true }))}`
		]
			.filter((text) => text !== null)
			.join('\n');

		await this.player.user.send(actionText);
	}

	public async onDay() {
		const { game } = this;

		let actionText = this.game.t('roles/global:dayActionPromptSingleTarget', {
			prefix: PREFIX,
			cycle: game.cycle,
			action: this.action,
			actionText: this.actionText
		});
		actionText += `${codeBlock('diff', game.players.show({ codeblock: true }))}`;

		await this.player.user.send(actionText);
	}

	public async onPmCommand(message: Message, command: string, ...args: string[]) {
		// day commands use a completely different action flow
		let { check, reason } = this.canUseAction();
		if (!check) throw this.game.t('roles/global:actionBlocked', { reason });

		if (this.game.phase === Phase.Day || this.game.phase === Phase.Trial || this.game.phase === Phase.TrialVoting)
			return this.onDayCommand(message, command, ...args);
		if (!this.possibleActions.includes(command)) return;

		removeArrayItem(this.game.nightActions, (action) => action.actor === this.player);

		switch (command) {
			case 'cancel':
				return this.player.user.send(this.game.t('roles/global:actionCancelled'));
			case 'noaction': {
				await this.player.user.send(this.game.t('roles/global:noAction'));
				return this.game.nightActions.addAction({
					action: undefined,
					actor: this.player,
					priority: this.priority
				});
			}
			default: {
				const target = this.getTarget(args, this.game);

				({ check, reason } = this.canTarget(target));
				if (!check) {
					throw this.game.t('roles/global:actionBlockedTarget', {
						target: Array.isArray(target) ? target : [target]
					});
				}

				if (this.name === 'Godfather' && this.game.players.some((player) => player.isAlive && player.role.name === 'Goon')) {
					// first we remove any older action the goon had
					this.game.nightActions.splice(
						this.game.nightActions.findIndex((action) => action.actor.role.name === 'Goon'),
						1
					);
					// the Godfather also orders his Goon to kill
					await this.game.nightActions.addAction({
						action: this.action,
						actor: this.game.players.find((pl) => pl.role.name === 'Goon')!,
						target,
						priority: this.priority,
						flags: this.flags ?? DEFAULT_ACTION_FLAGS
					});
				}

				await this.player.user.send(this.actionConfirmation(target));

				await this.player.game.nightActions.addAction({
					action: this.action,
					actor: this.player,
					target,
					priority: this.priority,
					flags: this.flags ?? DEFAULT_ACTION_FLAGS
				});
			}
		}
	}

	public getTarget(args: string[], game: Game): Player[] | Player {
		const target = Player.resolve(this.player.game, args.join(' '));
		if (!target) throw this.game.t('roles/global:targetInvalid', { maxPlayers: this.game.players.length });
		return target;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async onDayCommand(message: Message, command: string, ...args: string[]) {
		// noop
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public setUp(actions: NightActionsManager, target?: Player | Player[]): Awaited<any> {
		// noop
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public runAction(actions: NightActionsManager, target?: Player | Player[]): Awaited<any> {
		// noop
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public tearDown(actions: NightActionsManager, target?: Player | Player[]): Awaited<any> {
		// noop
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public canTarget(target: Player | Player[]) {
		if (!(target as Player).isAlive) return { check: false, reason: this.game.t('roles/global:targetDeadPlayers') };
		return { check: target !== this.player, reason: this.game.t('roles/global:targetSelf') };
	}

	public canUseAction() {
		return { check: this.player.isAlive, reason: '' };
	}

	public actionConfirmation(target: Player | Player[]) {
		return `You are ${this.actionGerund} ${Array.isArray(target) ? listItems(target.map((tgt) => tgt.user.username)) : target} tonight.`;
	}

	// eslint-disable-next-line @typescript-eslint/class-literal-property-style
	public get defaultAction(): NightAction | null {
		return null;
	}

	// eslint-disable-next-line @typescript-eslint/class-literal-property-style
	public get extraNightContext(): string | null {
		return null;
	}

	public get client() {
		return this.player.user.client;
	}

	private get possibleActions() {
		return [this.action, 'noaction', 'cancel'];
	}
}

interface SingleTarget {
	action: string;
	actionGerund: string;
	actionText: string;
	flags?: {
		canBlock?: boolean;
		canTransport?: boolean;
		canVisit?: boolean;
		canWitch?: boolean;
	};
	priority: NightActionPriority;
}

export default SingleTarget;
