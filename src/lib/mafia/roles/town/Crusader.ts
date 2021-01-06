import SingleTarget from '#mafia/mixins/SingleTarget';
import Townie from '#mafia/mixins/Townie';
import NightActionsManager, { Attack, NightActionPriority } from '../../managers/NightActionsManager';
import Player from '#mafia/structures/Player';

class Crusader extends SingleTarget {

	public name = 'Crusader';
	public description = 'You may protect someone every night, attacking one randomly selected visitor if your target is visited.';
	public action = 'protect';
	public actionText = 'protect a player';
	public actionGerund = 'protecting';
    public priority = NightActionPriority.CRUSADER;
    private isTargetAttacked = false;

	public runAction(actions: NightActionsManager, target: Player) {
        const playerRecord = actions.record.get(target.user.id);
        if (playerRecord.size == 0) {
            return;
		}

		// Select visitor to be killed.
		var visitors : Set<Player> = new Set();
		var actionNames = [...playerRecord.keys()]
		for (let i = 0; i < playerRecord.size; i++) {
			let actionName = actionNames[i]
			playerRecord.get(actionName).by.forEach(visitor => visitors.add(visitor))
		}
		var playerToKill : Player = Array.from(visitors)[Math.floor(Math.random() * visitors.size)]
		
		// Block all nightkills.
		const nightKills = playerRecord.get('nightkill');
		if (nightKills && nightKills.result === true && nightKills.type && nightKills.type < Attack.Unstoppable) {
			this.isTargetAttacked = true;
			playerRecord.set('nightkill', { result: false, by: [] });
		}
			
		const protects = playerRecord.get('protect');
		protects.result = true;
		protects.by.push(this.player);
		playerRecord.set('protect', protects);
		actions.record.set(target.user.id, playerRecord);
		
		// Kill the visitor.
		actions.record.setAction(playerToKill.user.id, 'nightkill', { result: true, by: [this.player] });
		playerToKill.queueMessage('You were killed by a Crusader!');
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id).get('guard');
		const success = target.user.id !== this.player.user.id && record.result && record.by.includes(this.player);

		if (success && this.isTargetAttacked) {
			return target.queueMessage('You were attacked but somebody fought off your attacker!');
			this.isTargetAttacked = false;
		}
	}

	public canTarget(player: Player) {
		// TODO: customizable rule here
		if (player === this.player) return { check: false, reason: 'You cannot target yourself.' };
		return super.canTarget(player);
    }
    
	public actionConfirmation(target: Player) {
		return `You are ${this.actionGerund} ${target} tonight.`;
	}

}

Crusader.categories = [...Crusader.categories, 'Town Protective'];

export default Townie(Crusader);
