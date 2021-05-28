import GuardianAngelFaction from '@mafia/factions/neutral/GuardianAngel';
import NightActionsManager, { Attack } from '@mafia/managers/NightActionsManager';
import type Player from '@mafia/structures/Player';
import { randomArrayItem, removeArrayItem } from '@util/utils';
import type { Message } from 'discord.js';
import { allRoles } from '..';
import { NoTargetAction } from '../../actions/mixins/NoTargetAction';
import { ActionRole } from '../../structures/ActionRole';

class Guardian_Angel extends ActionRole {
	public name = 'Guardian Angel';
	public faction = new GuardianAngelFaction();

	public target!: Player;
	private protects: number;

	public constructor(player: Player) {
		super(player);
		this.protects = this.game ? this.getInitialProtects() : 0;
		this.description = this.game.t('roles/neutral:guardianAngelDescription', { count: this.protects });
		this.actions = [new ProtectAction(this, this.protects)];
	}

	public async init() {
		const possibleTargets = this.game.players.filter(
			(player) => player.role.name !== 'Jester' && player.role.name !== 'Executioner' && player.role.name !== 'Guardian Angel'
		);
		if (possibleTargets.length === 0) {
			await this.player.user.send(this.game.t('roles/neutral:guardianAngelNoTargets'));
			const Survivor = allRoles.get('Survivor')!;
			this.player.role = new Survivor(this.player, { vests: 0 });
			return this.player.sendPM();
		}

		this.target = randomArrayItem(possibleTargets)!;
		return this.player.user.send(this.game.t('roles/neutral:executionerMessage', { target: this.target.user.tag }));
	}

	public canUseAction() {
		if (!this.player.isAlive && this.actions[0].remainingUses !== 0) return { check: true, reason: '' };
		return super.canUseAction();
	}

	public async onDay() {
		if (!this.target.isAlive && this.player.isAlive) {
			await this.player.user.send(this.game.t('roles/neutral:guardianAngelTargetDead'));
			const Survivor = allRoles.get('Survivor')!;
			this.player.role = new Survivor(this.player, { vests: 0 });
			return this.player.sendPM();
		}
	}

	public async onNight() {
		removeArrayItem(this.game.nightActions.protectedPlayers, (player) => player === this.target);

		if (!this.target.isAlive && this.player.isAlive) {
			await this.player.user.send(this.game.t('roles/neutral:guardianAngelTargetDead'));
			const Survivor = allRoles.get('Survivor')!;
			this.player.role = new Survivor(this.player, { vests: 0 });
			await this.player.sendPM();
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			return new Promise<Message>(() => {});
		}

		return super.onNight();
	}

	private getInitialProtects() {
		if (this.game.players.length <= 5) return 1;
		if (this.game.players.length <= 10) return 2;
		return 3;
	}
}

export interface GuardianAngelContext {
	protects?: number;
}

Guardian_Angel.aliases = ['GA'];
Guardian_Angel.categories = [...Guardian_Angel.categories, 'Random Neutral', 'Neutral Benign'];

export default Guardian_Angel;

export class ProtectAction extends NoTargetAction {
	public name = 'protect';

	public constructor(role: ActionRole, protects: number) {
		super(role, protects);
		this.actionText = this.game.t('roles/actions:guardianAngelText');
		this.actionGerund = this.game.t('roles/actions:guardianAngelGerund');
	}

	public runAction(actions: NightActionsManager) {
		const playerRecord = actions.record.get((this.role as Guardian_Angel).target.user.id);
		if (playerRecord.has('nightkill')) {
			const nightKills = playerRecord.get('nightkill');
			const isClConverting = actions.find(
				(action) => action.actor.role.name === 'Cult Leader' && action.target === (this.role as Guardian_Angel).target
			);

			if (isClConverting || (nightKills.result && nightKills.type && nightKills.type < Attack.Unstoppable)) {
				playerRecord.set('nightkill', { result: false, by: [] });

				const heals = playerRecord.get('heal');
				heals.result = true;
				heals.by.push(this.player);
				playerRecord.set('heal', heals);

				actions.record.set((this.role as Guardian_Angel).target.user.id, playerRecord);
				this.player.queueMessage(this.game.t('roles/neutral:guardianAngelTargetAttacked'));
			}
		}

		actions.protectedPlayers.push((this.role as Guardian_Angel).target);
	}

	public tearDown(actions: NightActionsManager) {
		const record = actions.record.get((this.role as Guardian_Angel).target.user.id).get('heal');
		const success = record.result && record.by.includes(this.player);

		if (success) {
			(this.role as Guardian_Angel).target.queueMessage(this.game.t('roles/neutral:guardianAngelSave'));
		}
		return this.game.channel.send(
			this.game.t('roles/neutral:guardianAngelAnnouncement', { target: (this.role as Guardian_Angel).target.user.tag })
		);
	}

	public get extraNightContext() {
		if (this.remainingUses > 0) return this.game.t('roles/neutral:guardianAngelContext', { count: this.remainingUses });
		return null;
	}
}
