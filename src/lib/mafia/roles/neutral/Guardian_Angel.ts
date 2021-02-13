import GuardianAngelFaction from '@mafia/factions/neutral/GuardianAngel';
import NightActionsManager, { Attack, NightActionPriority } from '@mafia/managers/NightActionsManager';
import NoTarget from '@mafia/mixins/NoTarget';
import type Player from '@mafia/structures/Player';
import { randomArrayItem, removeArrayItem } from '@util/utils';
import { allRoles } from '..';

class Guardian_Angel extends NoTarget {
	public name = 'Guardian Angel';
	public faction = new GuardianAngelFaction();
	public action = 'protect';
	public actionGerund = 'protecting your target';
	public actionText = 'protect your target';
	public priority = NightActionPriority.GUARDIAN_ANGEL;

	public target!: Player;
	private protects: number;

	public constructor(player: Player, context: GuardianAngelContext = {}) {
		super(player);
		if (typeof context.protects === 'number') this.protects = context.protects;
		else this.protects = this.getInitialProtects();

		this.description = this.game.t('roles/neutral:guardianAngelDescription', { count: this.protects });
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
		if (this.protects === 0) return { check: false, reason: this.game.t('roles/neutral:guardianAngelNoProtects') };
		if (!this.player.isAlive) return { check: true, reason: '' };
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
			return this.player.sendPM();
		}

		return super.onNight();
	}

	public runAction(actions: NightActionsManager) {
		const playerRecord = actions.record.get(this.target.user.id);
		if (playerRecord.has('nightkill')) {
			const nightKills = playerRecord.get('nightkill');
			const isClConverting = actions.find((action) => action.actor.role.name === 'Cult Leader' && action.target === this.target);

			if (isClConverting || (nightKills.result && nightKills.type && nightKills.type < Attack.Unstoppable)) {
				playerRecord.set('nightkill', { result: false, by: [] });

				const heals = playerRecord.get('heal');
				heals.result = true;
				heals.by.push(this.player);
				playerRecord.set('heal', heals);

				actions.record.set(this.target.user.id, playerRecord);
				this.player.queueMessage(this.game.t('roles/neutral:guardianAngelTargetAttacked'));
			}
		}

		actions.protectedPlayers.push(this.target);
		return this.protects--;
	}

	public tearDown(actions: NightActionsManager) {
		const record = actions.record.get(this.target.user.id).get('heal');
		const success = record.result && record.by.includes(this.player);

		if (success) {
			this.target.queueMessage(this.game.t('roles/neutral:guardianAngelSave'));
		}
		return this.game.channel.send(this.game.t('roles/neutral:guardianAngelAnnouncement', { target: this.target.user.tag }));
	}

	public get extraNightContext() {
		if (this.protects > 0) return this.game.t('roles/neutral:guardianAngelContext', { count: this.protects });
		return null;
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
Guardian_Angel.categories = [...Guardian_Angel.categories, 'Neutral Benign'];

export default Guardian_Angel;
