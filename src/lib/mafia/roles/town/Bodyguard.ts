import SingleTarget from '@root/lib/mafia/mixins/SingleTarget';
import Townie from '@mafia/mixins/Townie';
import NightActionsManager, { Attack, NightActionPriority } from '../../managers/NightActionsManager';
import Player from '@mafia/Player';

class Bodyguard extends SingleTarget {

	public name = 'Bodyguard';
	public description = 'You may guard someone every night.';
	public action = 'guard';
	public actionText = 'guard a player';
	public actionGerund = 'guarding';
	public priority = NightActionPriority.BODYGUARD;
	public hasGuarded = false;

	public runAction(actions: NightActionsManager, target: Player) {
		if (target.user.id === this.player.user.id) this.hasGuarded = true;

		const playerRecord = actions.record.get(target.user.id);
		if (!playerRecord.has('nightkill')) return;

		const nightKills = playerRecord.get('nightkill');

		if (nightKills.result === true && nightKills.type && nightKills.type < Attack.Unstoppable) {
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
				this.player.queueMessage('You were killed while defending your target!');
				// kill the attacker
				actions.record.setAction(attacker.user.id, 'nightkill', { result: true, by: [this.player] });
				this.player.queueMessage('You were killed by a Bodyguard!');
			}
		}
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id).get('guard');
		const success = target.user.id !== this.player.user.id && record.result && record.by.includes(this.player);

		if (success) {
			return target.queueMessage('You were attacked but somebody fought off your attacker!');
		}
	}

	public canTarget(player: Player) {
		// TODO: customizable rule here
		if (player === this.player && this.hasGuarded) return { check: false, reason: 'You can vest only once per game.' };
		if (!player.isAlive) return { check: false, reason: 'You cannot target dead players.' };
		return { check: true, reason: '' };
	}

	public get extraNightContext() {
		return `You ${this.hasGuarded ? 'cannot' : 'can'} vest tonight.`;
	}

	public actionConfirmation(target: Player) {
		if (target === this.player) return 'You are self-vesting tonight.';
		return `You are ${this.actionGerund} ${target} tonight.`;
	}

}

Bodyguard.aliases = ['BG'];
Bodyguard.categories = [...Bodyguard.categories, 'Town Protective'];

export default Townie(Bodyguard);
