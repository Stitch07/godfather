import ArsonistFaction from '../../factions/neutral/Arsonist';
import NightActionsManager, { Attack, Defence, NightActionPriority } from '../../managers/NightActionsManager';
import type Player from '@mafia/structures/Player';
import { SingleTargetAction } from '../../actions/mixins/SingleTargetAction';
import { ActionRole } from '../../structures/ActionRole';
import type { NightAction } from '../../managers/NightAction';
import { NoTargetAction } from '../../actions/mixins/NoTargetAction';

class Arsonist extends ActionRole {
	public name = 'Arsonist';
	public faction = new ArsonistFaction();
	public actions: NightAction[] = [new DouseAction(this), new IgniteAction(this)];
	public dousedPlayers: Player[] = [];

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/neutral:arsonistDescription');
	}

	public get defence() {
		return Defence.Basic;
	}

	public canUseAction(command: string) {
		if (command === 'ignite' && this.dousedPlayers.length === 0) {
			return { check: false, reason: this.game.t('roles/neutral:arsonistNoIgnite') };
		}
		return super.canUseAction(command);
	}

}

Arsonist.categories = ['Random Neutral', 'Evil', 'Neutral Killing'];
Arsonist.aliases = ['Arso'];

export default Arsonist;

export class DouseAction extends SingleTargetAction {
	public name = 'douse';
	public priority = NightActionPriority.ARSONIST;

	public runAction(_: NightActionsManager, target: Player) {
		(this.role as Arsonist).dousedPlayers.push(target);
	}

	public canUse(target: Player) {
		if ((this.role as Arsonist).dousedPlayers.includes(target)) {
			return { check: false, reason: this.game.t('roles/neutral:arsonistAlreadyDoused') };
		}
		return super.canUse(target);
	}

}

export class IgniteAction extends NoTargetAction {
	public name = 'ignite';
	public priority = NightActionPriority.ARSONIST;

	public runAction(actions: NightActionsManager) {
		for (const target of (this.role as Arsonist).dousedPlayers) {
			actions.record.setAction(target.user.id, 'nightkill', { result: true, by: [this.player], type: Attack.Unstoppable });
		}
	}

	public tearDown(actions: NightActionsManager) {
		for (const target of (this.role as Arsonist).dousedPlayers) {
			const record = actions.record.get(target.user.id).get('nightkill');
			const success = record.result && record.by.includes(this.player);
			if (success) {
				target.queueMessage(this.game.t('roles/neutral:arsonistIgnitedBy'));
			}
		}

		(this.role as Arsonist).dousedPlayers = [];
	}

}
