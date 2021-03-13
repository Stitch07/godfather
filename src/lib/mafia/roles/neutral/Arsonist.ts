import { PREFIX } from '@root/config';
import { codeBlock } from '@sapphire/utilities';
import { cast, removeArrayItem } from '@util/utils';
import type { Message } from 'discord.js';
import ArsonistFaction from '../../factions/neutral/Arsonist';
import NightActionsManager, { Attack, Defence, NightActionPriority } from '../../managers/NightActionsManager';
import { Phase } from '../../structures/Game';
import Player from '../../structures/Player';
import Role from '../../structures/Role';

class Arsonist extends Role {
	public name = 'Arsonist';
	public faction = new ArsonistFaction();
	public actionPhase = Phase.Night;
	public priority = NightActionPriority.ARSONIST;
	public action = ['douse', 'ignite'];
	private dousedPlayers: Player[] = [];
	private ignited = false;

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/neutral:arsonistDescription');
	}

	public async onPmCommand(_: Message, command: string, ...args: string[]) {
		if (!this.validActions.includes(command)) return;
		if (command === 'ignite' && this.dousedPlayers.length === 0) throw "You haven't doused anyone to ignite yet!";

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
			case 'ignite': {
				void this.game.nightActions.addAction({
					action: 'ignite',
					actor: this.player,
					target: this.dousedPlayers.filter((player) => player.isAlive),
					priority: this.priority,
					flags: {
						canBlock: false,
						canTransport: false,
						canVisit: false,
						canWitch: false
					}
				});

				this.ignited = true;
				return this.player.user.send(this.game.t('roles/neutral:arsonistIgniting'));
			}

			case 'douse': {
				const target = Player.resolve(this.player.game, args.join(' '));
				if (!target) throw this.game.t('roles/global:invalidTarget', { maxPlayers: this.game.players.length });

				if (target === this.player) throw this.game.t('roles/global:targetSelf');
				if (this.dousedPlayers.includes(target)) throw this.game.t('roles/neutral:arsonistAlreadyDoused', { target });

				await this.player.user.send(this.game.t('roles/neutral:arsonistActionConfirmation', { target }));
				return this.game.nightActions.addAction({
					action: 'ignite',
					actor: this.player,
					target,
					priority: this.priority
				});
			}
		}
	}

	public onNight() {
		if (this.ignited) {
			// the last action was an ignite, so clear all targets
			this.dousedPlayers = [];
			this.ignited = false;
		}

		const output = [
			this.game.t('roles/neutral:arsonistPrompt', { cycle: this.game.cycle, prefix: PREFIX }),
			this.dousedPlayers.length === 0
				? null
				: this.game.t('roles/neutral:arsonistContext', { players: this.dousedPlayers.map((player) => player.toString()) }),
			codeBlock('diff', this.game.players.show({ codeblock: true }))
		]
			.filter((line) => line !== null)
			.join('\n');

		return this.player.user.send(output);
	}

	public setUp() {
		// noop
	}

	public runAction(actions: NightActionsManager, targets: Player | Player[]) {
		if (this.ignited) {
			for (const target of cast<Player[]>(targets)) {
				actions.record.setAction(target.user.id, 'nightkill', { result: true, by: [this.player], type: Attack.Unstoppable });
			}
		} else {
			this.dousedPlayers.push(cast<Player>(targets));
		}
	}

	public async tearDown(actions: NightActionsManager, targets: Player | Player[]) {
		if (!this.ignited) return;
		for (const target of cast<Player[]>(targets)) {
			const record = actions.record.get(target.user.id).get('nightkill');
			const success = record.result && record.by.includes(this.player);
			if (success) {
				await target.queueMessage(this.game.t('roles/neutral:arsonistIgnitedBy'));
			}
		}
	}

	public get defence() {
		return Defence.Basic;
	}

	public canUseAction() {
		return { check: true, reason: '' };
	}

	private get validActions() {
		return [...this.action, 'noaction', 'cancel'];
	}
}

Arsonist.categories = ['Random Neutral', 'Evil', 'Neutral Killing'];
Arsonist.aliases = ['Arso'];

export default Arsonist;
