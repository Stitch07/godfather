import Role from '@mafia/Role';
import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import Player from '@mafia/Player';
import { Phase } from '@mafia/Game';
import { Awaited, codeBlock } from '@sapphire/utilities';
import { remove } from '@util/utils';
import { Message } from 'discord.js';


class ActionRole extends Role {

	public actionPhase = Phase.Night;

	public constructor(player: Player) {
		super(player);
	}

	public async onNight() {
		const { game } = this.player;
		const prefix = await this.client.fetchGuildPrefix(game.channel.guild);
		let actionText = `It is now night ${game.cycle}. Use the ${prefix}${this.action} command to ${this.actionText}. Use ${prefix}noaction to stay home.\n`;
		actionText += `${codeBlock('diff', game.players.show({ codeblock: true }))}`;
		await this.player.user.send(actionText);
	}

	public async onDay() {
		const { game } = this;
		const prefix = await this.client.fetchGuildPrefix(game.channel.guild);
		let actionText = `It is now day ${game.cycle}. Use the ${prefix}${this.action} command to ${this.actionText} immediately.`;
		actionText += `${codeBlock('diff', game.players.show({ codeblock: true }))}`;
		await this.player.user.send(actionText);
	}

	public async onPmCommand(message: Message, command: string, ...args: string[]) {
		// day commands use a completely different action flow
		let { check, reason } = this.canUseAction();
		if (!check) throw `You cannot use your action. ${reason}`;

		if (this.game.phase === Phase.Day) return this.onDayCommand(message, command, ...args);
		if (!this.possibleActions.includes(command)) return;

		remove(this.game.nightActions, action => action.actor === this.player);

		switch (command) {
			case 'cancel':
				return this.player.user.send('You have cancelled your action.');
			case 'noaction': {
				await this.game.nightActions.addAction({
					action: undefined,
					actor: this.player,
					priority: this.priority
				});
				return this.player.user.send('You decided to stay home tonight.');
			}
			default: {
				const target = Player.resolve(this.player.game, args.join(' '));
				if (!target) throw `Invalid target. Choose a number between 1 and ${this.player.game.players.length}`;

				({ check, reason } = this.canTarget(target));
				if (!check) throw `You cannot target ${target.user.username}. ${reason}`;

				await this.player.game.nightActions.addAction({
					action: this.action,
					actor: this.player,
					target,
					priority: this.priority,
					flags: this.flags
				});

				return this.player.user.send(`You are ${this.actionGerund} ${target} tonight.`);
			}
		}
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
	public canTarget(player: Player) {
		return { check: true, reason: '' };
	}

	public canUseAction() {
		return { check: this.player.isAlive, reason: '' };
	}

	public get client() {
		return this.player.user.client;
	}

	private get possibleActions() {
		return [this.action, 'noaction'];
	}

}

interface ActionRole {
	action: string;
	actionGerund: string;
	actionText: string;
	flags: {
		canBlock: boolean;
		canTransport: boolean;
		canVisit: boolean;
	};
	priority: NightActionPriority;
}

export default ActionRole;
