import Townie from '@mafia/mixins/Townie';
import { Phase } from '@mafia/structures/Game';
import type { Message } from 'discord.js';
import type Player from '@mafia/structures/Player';
import { SingleTargetAction } from '../../actions/mixins/SingleTargetAction';
import { ActionRole } from '../../structures/ActionRole';

class Mayor extends ActionRole {
	public name = 'Mayor';
	public hasRevealed = false;

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:mayorDescription');
	}

	public get voteWeight() {
		return this.hasRevealed ? 3 : 1;
	}

	public canUseAction() {
		if (this.hasRevealed) return { check: false, reason: this.game.t('roles/town:mayorAlreadyRevealed') };
		return super.canUseAction();
	}

	public static unique = true;
}

Mayor.categories = [...Mayor.categories, 'Town Support'];

export default Townie(Mayor);

export class MayorRevealAction extends SingleTargetAction {
	public name = 'reveal';
	public actionPhase = Phase.Day | Phase.Trial | Phase.TrialVoting;
	public constructor(role: ActionRole) {
		super(role);
		this.actionText = this.game.t('roles/actions:mayorText');
		this.actionGerund = this.game.t('roles/actions:mayorGerund');
	}

	public async onDayCommand(message: Message, command: string) {
		if (command !== 'reveal') return;

		await message.react('✅');
		await this.game.channel.send(this.game.t('roles/town:mayorAnnouncement', { player: this.player }));
		(this.role as Mayor).hasRevealed = true;
	}
}
