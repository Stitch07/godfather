import { codeBlock } from '@klasa/utils';

import Role from '@mafia/Role';
import NightActionsManager, { NightActionPriority, NightActionCommand, RoleEvent } from '@mafia/managers/NightActionsManager';
import Player from '@mafia/Player';


class ActionRole extends Role {

	public async onEvent(name: RoleEvent, ...args: any[]) {

		if (name === RoleEvent.NIGHT_START) {
			const { game } = this.player;
			const prefix = game.channel.guild.settings.get('prefix')!;
			let actionText = `It is now night ${game.cycle}. Use the ${prefix}${this.action} command to ${this.actionText}. Use ${prefix}noaction to stay home.\n`;
			actionText += `${codeBlock('diff', game.players.show({ codeblock: true }))}`;
			await this.player.user.sendMessage(actionText);

		} else if (name === RoleEvent.PM_COMMAND) {
			const [command, ...params] = args as string[];
			if (!this.possibleActions.includes(command)) return;
			const target = Player.resolve(this.player.game, params.join(' '));
			if (!target) throw `Invalid target. Choose a number between 1 and ${this.player.game.players.length}`;

			let { check, reason } = this.canUseAction();
			if (!check) throw `You cannot use your action. ${reason}`;
			({ check, reason } = this.canTarget(target));
			if (!check) throw `You cannot target ${target.user.username}. ${reason}`;

			this.player.game.nightActions.push({
				action: this.action,
				actor: this.player,
				target,
				priority: this.priority,
				flags: this.flags
			});
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async setUp(actions: NightActionsManager, target?: Player) {
		// noop
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async runAction(actions: NightActionsManager, target?: Player) {
		// noop
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async tearDown(actions: NightActionsManager, target?: Player) {
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
	action: NightActionCommand;
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
