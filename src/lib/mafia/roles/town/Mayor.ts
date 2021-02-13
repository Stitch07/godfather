import SingleTarget from '@mafia/mixins/SingleTarget';
import Townie from '@mafia/mixins/Townie';
import { Phase } from '@mafia/structures/Game';
import type { Message } from 'discord.js';
import type Player from '@mafia/structures/Player';

class Mayor extends SingleTarget {
	public name = 'Mayor';
	public action = 'reveal';
	public actionText = 'to reveal yourself as the mayor';
	public actionPhase = Phase.Day | Phase.Trial | Phase.TrialVoting;
	public hasRevealed = false;

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:mayorDescription');
	}

	public async onDayCommand(message: Message, command: string) {
		if (command !== 'reveal') return;

		await message.react('✅');
		await this.game.channel.send(this.game.t('roles/town:mayorAnnouncement', { player: this.player }));
		this.hasRevealed = true;
	}

	public canUseAction() {
		if (this.hasRevealed) return { check: false, reason: this.game.t('roles/town:mayorAlreadyRevealed') };
		return super.canUseAction();
	}

	public get voteWeight() {
		return this.hasRevealed ? 3 : 1;
	}

	public static unique = true;
}

Mayor.categories = [...Mayor.categories, 'Town Support'];

export default Townie(Mayor);
