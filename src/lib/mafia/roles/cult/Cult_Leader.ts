import SingleTarget from '@mafia/mixins/SingleTarget';
import { allRoles } from '..';
import CultFaction from '../../factions/Cult';
import NightActionsManager, { Attack, Defence, NightActionPriority } from '../../managers/NightActionsManager';
import Player from '../../structures/Player';

// the factions that the CL can convert
const CAN_CONVERT = ['Town', 'Survivor', 'Amnesiac', 'Jester'];

export default class CultLeader extends SingleTarget {

	public faction = new CultFaction();
	public name = 'Cult Leader';
	public description = "You're the leader of a mysterious cult and want everyone to follow your beliefs.";
	public action = 'convert';
	public actionText = 'convert a player';
	public actionGerund = 'converting';
	public priority = NightActionPriority.CultLeader;

	// the last cycle with a successful conversion. setting it to -1 lets the CL convert someone on N1
	private lastConverted = -1;
	private successfulConversion = false;

	public canUseAction() {
		if (this.game.cycle - this.lastConverted < 2) return { check: false, reason: 'You cannot convert on 2 consecutive nights.' };
		return super.canUseAction();
	}

	public setUp() {
		this.successfulConversion = false;
	}

	public runAction(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id);
		// players with basic defence, healed or GAed cannot be converted
		if (
			target.role.actualDefence >= Defence.Basic
				|| record.get('heal').result
				|| record.get('guard').result
		) return;

		if (!CAN_CONVERT.includes(target.role.faction.name)) {
			// kill the target if CL cannot convert
			actions.record.setAction(target.user.id, 'nightkill', { result: true, by: [this.player], type: Attack.Unstoppable });
			target.queueMessage('You were denounced by a Cult Leader.');
			return;
		}
		// convert the player
		this.lastConverted = this.game.cycle;
		this.successfulConversion = true;
	}

	public async tearDown(actions: NightActionsManager, target: Player) {
		if (!this.successfulConversion) return;
		const CultMember = allRoles.get('Cult Member')!;
		target.role = new CultMember(target);
		await target.user.send('You were converted by a Cult!');
		this.player.queueMessage(`You successfully converted ${target.user.username}!`);
		await target.sendPM();
	}

	public async onDeath() {
		const followers = this.game.players.filter(player => player.isAlive && player.role.name === 'Cult Member');
		for (const follower of followers) {
			await follower.kill(`committed suicide; N${this.game.cycle}`);
			await this.game.channel.send(`${follower} died last night. ${follower.displayRoleAndWill(true)}`);
			follower.queueMessage('You committed suicide after losing your Cult Leader!');
		}
	}

}
