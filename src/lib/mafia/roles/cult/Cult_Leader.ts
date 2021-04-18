import SingleTarget from '@mafia/mixins/SingleTarget';
import { allRoles } from '..';
import CultFaction from '../../factions/Cult';
import NightActionsManager, { Attack, Defence, NightActionPriority } from '../../managers/NightActionsManager';
import { Phase } from '@mafia/structures/Game';
import type Player from '@mafia/structures/Player';

// the factions that the CL can convert
const CAN_CONVERT = ['Town', 'Survivor', 'Amnesiac', 'Jester'];

class CultLeader extends SingleTarget {
	public faction = new CultFaction();
	public name = 'Cult Leader';
	public action = 'convert';
	public priority = NightActionPriority.CultLeader;

	// whether the CL was already attacked once
	public attacked = false;

	// the last cycle with a successful conversion. setting it to -1 lets the CL convert someone on N1
	private lastConverted = -1;
	private successfulConversion = false;

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/cult:cultLeaderDescription');
		this.actionText = this.game.t('roles/actions:cultLeaderText');
		this.actionGerund = this.game.t('roles/actions:cultLeaderGerund');
	}

	public get defence() {
		return this.attacked ? Defence.None : Defence.Basic;
	}

	public canUseAction() {
		if (this.game.cycle - this.lastConverted < 2) return { check: false, reason: this.game.t('roles/cult:cultLeaderConsecutiveNights') };
		return super.canUseAction();
	}

	public setUp() {
		this.successfulConversion = false;
	}

	public runAction(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id);
		// players with basic defence, healed or GAed cannot be converted
		if (target.role.actualDefence >= Defence.Basic || record.get('heal').result || record.get('guard').result) return;

		if (!CAN_CONVERT.includes(target.role.faction.name)) {
			// kill the target if CL cannot convert
			actions.record.setAction(target.user.id, 'nightkill', { result: true, by: [this.player], type: Attack.Basic });
			target.queueMessage(this.game.t('roles/cult:cultLeaderDenounce'));
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
		await target.user.send(this.game.t('roles/cult:successfulConversion'));
		this.player.queueMessage(this.game.t('roles/cult:conversionMessage', { target: target.user.username }));
		await target.sendPM();
	}

	public async onDeath() {
		const followers = this.game.players.filter((player) => player.isAlive && player.role.name === 'Cult Member');
		const phaseStr = this.game.phase === Phase.Night ? 'N' : 'D';
		for (const follower of followers) {
			await follower.kill(`${this.game.t('roles/cult:cultMemberDeathReason')}; ${phaseStr}${this.game.cycle}`);
			await this.game.channel.send(
				`${this.game.t('roles/cult:cultMemberSuicideAnnouncement', { follower })} ${follower.displayRoleAndWill(true)}`
			);
			follower.queueMessage(this.game.t('roles/cult:cultMemberSuicide'));
		}
	}

	public static unique = true;
}

CultLeader.aliases = ['CL'];

export default CultLeader;
