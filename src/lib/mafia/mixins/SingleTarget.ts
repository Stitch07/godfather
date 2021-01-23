// @ts-expect-error (1371) Bypass not being able to type import default and named
import NightActionsManager, { NightAction, NightActionPriority } from '@mafia/managers/NightActionsManager';
import Game, { Phase } from '@mafia/structures/Game';
import Player from '@mafia/structures/Player';
import Role from '@mafia/structures/Role';
import { PREFIX } from '@root/config';
import { DEFAULT_ACTION_FLAGS } from '@root/lib/constants';
import { Awaited, codeBlock } from '@sapphire/utilities';
import { listItems, remove } from '@util/utils';
import type { Message } from 'discord.js';

class SingleTarget extends Role {
	public actionPhase = Phase.Night;

	public constructor(player: Player) {
		super(player);
	}

	public async onNight() {
		const { game } = this.player;

		const actionText = [
			`It is now night ${game.cycle}. Use ${PREFIX}${this.action} <number> to ${this.actionText}. Use ${PREFIX}noaction to stay home.`,
			this.extraNightContext,
			`${codeBlock('diff', game.players.show({ codeblock: true }))}`
		]
			.filter((text) => text !== null)
			.join('\n');

		await this.player.user.send(actionText);
	}

	public async onDay() {
		const { game } = this;

		let actionText = `It is now day ${game.cycle}. Use the ${PREFIX}${this.action} command to ${this.actionText} immediately.`;
		actionText += `${codeBlock('diff', game.players.show({ codeblock: true }))}`;

		await this.player.user.send(actionText);
	}

	public async onPmCommand(message: Message, command: string, ...args: string[]) {
		// day commands use a completely different action flow
		let { check, reason } = this.canUseAction();
		if (!check) throw `You cannot use your action. ${reason}`;

		if (this.game.phase === Phase.Day) return this.onDayCommand(message, command, ...args);
		if (!this.possibleActions.includes(command)) return;

		remove(this.game.nightActions, (action) => action.actor === this.player);

		switch (command) {
			case 'cancel':
				return this.player.user.send('You have cancelled your action.');
			case 'noaction': {
				await this.player.user.send('You decided to stay home tonight.');
				return this.game.nightActions.addAction({
					action: undefined,
					actor: this.player,
					priority: this.priority
				});
			}
			default: {
				const target = this.getTarget(args, this.game);

				({ check, reason } = this.canTarget(target));
				if (!check)
					throw Array.isArray(target)
						? `You cannot target ${listItems(target.map((tgt) => tgt.user.username))} tonight: ${reason}`
						: `You cannot target ${target.user.username} tonight: ${reason}`;

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
		if (!target) throw `Invalid target. Choose a number between 1 and ${game.players.length}`;
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
		if (!(target as Player).isAlive) return { check: false, reason: 'You cannot target dead players.' };
		return { check: target !== this.player, reason: `As a ${this.display}, you cannot self-target.` };
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
