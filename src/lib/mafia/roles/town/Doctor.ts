import ActionRole from '@mafia/mixins/ActionRole';
import Townie from '@mafia/mixins/Townie';
import NightActionsManager, { Attack, NightActionPriority } from '../../managers/NightActionsManager';
import Player from '../../Player';

class Doctor extends ActionRole {

	public name = 'Doctor';
	public description = 'You may heal a player every night, and self-heal once.';
	public action = 'heal';
	public actionText = 'heal a player';
	public actionGerund = 'healing';
	public priority = NightActionPriority.DOCTOR;
	public hasSelfHealed = false;

	public runAction(actions: NightActionsManager, target: Player) {
		const playerRecord = actions.record.get(target.user.id);
		const nightKills = playerRecord.get('nightkill');

		console.log(nightKills);

		if (nightKills.result && nightKills.type && nightKills.type < Attack.Unstoppable) {
			nightKills.result = false;
			nightKills.by = [];
			playerRecord.set('nightkill', { result: false, by: [] });

			const heals = playerRecord.get('heal');
			heals.result = true;
			heals.by.push(this.player);
			playerRecord.set('heal', heals);

			if (target === this.player) this.hasSelfHealed = true;

			actions.record.set(target.user.id, playerRecord);
		}
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id).get('heal');
		const success = record.result && record.by.includes(this.player);

		if (success) {
			return target.user.send('You were attacked but somebody nursed you back to health!');
		}
	}

	public canTarget(player: Player) {
		// TODO: customizable rule here
		if (player === this.player && this.hasSelfHealed) return { check: false, reason: 'You can self-heal once per game.' };
		// docs cannot heal confirmed mayors
		if (player.role.name === 'Mayor' && Reflect.get(player.role, 'hasRevealed') === true) return { check: false, reason: 'You cannot heal a confirmed Mayor.' };
		return super.canTarget(player);
	}

}

Doctor.aliases.push('Doc');

export default Townie(Doctor);
