import JuggernautFaction from '@mafia/factions/neutral/Juggernaut';
import NightActionsManager, { Attack, Defence, NightActionPriority } from '@mafia/managers/NightActionsManager';
import Killer from '@root/lib/mafia/actions/common/KillerAction';
import type Player from '@mafia/structures/Player';

class Juggernaut extends Killer {
	public name = 'Juggernaut';
	public faction = new JuggernautFaction();
	public action = 'assault';
	public priority = NightActionPriority.KILLER;

	// level 1 lets them attack every night, level 2 lets them rampage, ands level 3 gives them a unstoppable attack
	public level = 0;

	public constructor(player: Player, { level }: { level?: number } = { level: 0 }) {
		super(player);
		this.level = level ?? 0;
		this.actionText = this.game.t('roles/actions:juggernautText');
		this.actionGerund = this.game.t('roles/actions:juggernautGerund');
		this.actionParticiple = this.game.t('roles/actions:juggernautParticiple');
	}

	public get defence() {
		return Defence.Basic;
	}

	public get attackStrength() {
		if (this.level === 3) return Attack.Unstoppable;
		return Attack.Powerful;
	}

	public canUseAction() {
		if (!this.canAttack()) return { check: false, reason: this.game.t('roles/neutral:juggernautFullMoonOnly') };
		return super.canUseAction();
	}

	public get extraNightContext() {
		return this.game.t('roles/neutral:juggernautContext', { level: this.level });
	}

	public runAction(actions: NightActionsManager, target: Player) {
		if (this.level >= 2) {
			const visitors = target.visitors.filter((player) => player.user.id !== this.player.user.id);
			for (const visitor of visitors) {
				if (visitor.role.actualDefence > this.attackStrength) continue;
				actions.record.setAction(visitor.user.id, 'nightkill', { result: true, by: [this.player], type: this.attackStrength });
				this.player.queueMessage(this.game.t('roles/neutral:juggernautAttackVisitors'));
				visitor.queueMessage(this.game.t('roles/neutral:juggernautAssault'));
			}
		}
		return super.runAction(actions, target);
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		const record = actions.record.get(target.user.id).get('nightkill');
		const success = record.result && record.by.includes(this.player);
		if (!success) {
			return this.player.queueMessage(this.game.t('roles/global:targetTooStrong'));
		}
		if (this.level < 3) this.level++;
		return target.queueMessage(this.game.t('roles/neutral:juggernautAssault'));
	}

	private canAttack() {
		if (this.level === 0) return this.game.isFullMoon;
		return true;
	}

	public static unique = true;
}

Juggernaut.aliases = ['Jugg'];
Juggernaut.categories = [...Juggernaut.categories, 'Random Neutral', 'Neutral Killing', 'Evil'];

export default Juggernaut;
