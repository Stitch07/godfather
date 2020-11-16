import { Awaited } from '@sapphire/framework';
import { remove } from '@util/utils';
import { Message } from 'discord.js';
import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import Role from '@mafia/Role';
import { Phase } from '@mafia/Game';
import { DEFAULT_ACTION_FLAGS } from '@root/lib/constants';

class NoTarget extends Role {

	public actionPhase = Phase.Night;

	public async onNight() {
		const { game } = this.player;
		const prefix = await this.game.channel.client.fetchGuildPrefix(game.channel.guild);
		let actionText = `It is now night ${game.cycle}. Use the ${prefix}${this.action} command to ${this.actionText}. Use ${prefix}noaction to stay home.\n`;
		await this.player.user.send(actionText);
	}

	public async onPmCommand(message: Message, command: string) {
		// day commands use a completely different action flow
		let { check, reason } = this.canUseAction();
		if (!check) throw `You cannot use your action. ${reason}`;

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
			default:
				await this.player.game.nightActions.addAction({
					action: this.action,
					actor: this.player,
					priority: this.priority,
					flags: this.flags ?? DEFAULT_ACTION_FLAGS
				});
		}

		return this.player.user.send(`You are ${this.actionGerund} tonight.`);
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
