import SingleTarget from '@mafia/mixins/SingleTarget';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';
import NightActionsManager, { Attack, NightActionPriority } from '../../managers/NightActionsManager';

class Bodyguard extends SingleTarget {
	public name = 'Bodyguard';
	public action = 'guard';
	public priority = NightActionPriority.BODYGUARD;
	public hasGuarded = false;

	public constructor(player: Player) {
		super(player);

		this.description = this.game.t('roles/town:bodyguardDescription');
		this.actionText = this.game.t('roles/actions:bodyguardText');
		this.actionGerund = this.game.t('roles/actions:bodyguardGerund');
	}

	public runAction(actions: NightActionsManager, target: Player) {
		if (target.user.id === this.player.user.id) this.hasGuarded = true;

		const playerRecord = actions.record.get(target.user.id);
		if (!playerRecord.has('nightkill')) return;

		const nightKills = playerRecord.get('nightkill');
		const isClConverting = actions.find((action) => action.actor.role.name === 'Cult Leader' && action.target === target);

		if (isClConverting || (nightKills.result && nightKills.type && nightKills.type < Attack.Unstoppable)) {
			const attacker = nightKills.by.pop()!;
			// BG only protects from one of the attackers
			playerRecord.set('nightkill', { result: false, by: [] });

			const guards = playerRecord.get('guard');
			guards.result = true;
			guards.by.push(this.player);
			playerRecord.set('guard', guards);

			actions.record.set(target.user.id, playerRecord);

			// self-vesting doesn't "guard" the player
			if (target.user.id !== this.player.user.id) {
				// kill the BG
				actions.record.setAction(this.player.user.id, 'nightkill', { result: true, by: [] });
				this.player.queueMessage(this.game.t('roles/town:bodyguardDiedDefending'));
				// kill the attacker
				actions.record.setAction(attacker.user.id, 'nightkill', { result: true, by: [this.player] });
				attacker.queueMessage(this.game.t('roles/town:bodyguardAttackerKilled'));
			}
		}
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id).get('guard');
		const success = target.user.id !== this.player.user.id && record.result && record.by.includes(this.player);

		if (success) {
			return target.queueMessage(this.game.t('bodyguardSave'));
		}
	}

	public canTarget(player: Player) {
		// TODO: customizable rule here
		if (player === this.player && this.hasGuarded) return { check: false, reason: this.game.t('roles/town:bodyguardVestOnce') };
		if (!player.isAlive) return { check: false, reason: this.game.t('roles/global:targetDeadPlayers') };
		return { check: true, reason: '' };
	}

	public get extraNightContext() {
		return this.hasGuarded ? this.game.t('roles/town:bodyguardCannotVest') : this.game.t('roles/town:bodyguardCanVest');
	}

	public actionConfirmation(target: Player) {
		if (target === this.player) return this.game.t('roles/town:bodyguardVesting');
		return this.game.t('roles/town:bodyguardConfirmation', { target });
	}
}

Bodyguard.aliases = ['BG'];
Bodyguard.categories = [...Bodyguard.categories, 'Town Protective'];

export default Townie(Bodyguard);
