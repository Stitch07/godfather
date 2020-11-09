import ActionRole from '@mafia/mixins/ActionRole';
import { Phase } from '@mafia/Game';
import Townie from '@mafia/mixins/Townie';
import { Message } from 'discord.js';

class Mayor extends ActionRole {

	public name = 'Mayor';
	public action = 'reveal';
	public actionText = 'to reveal yourself as the mayor';
	public actionPhase = Phase.Day;
	public description = 'You may reveal yourself as the Mayor of the Town.';
	public hasRevealed = false;

	public async onDayCommand(message: Message, command: string) {
		if (command !== 'reveal') return;

		await message.react('✅');
		await this.game.channel.send(`**${this.player}** has revealed themselves as the Mayor of the Town!`);
		this.hasRevealed = true;
	}

	public canUseAction() {
		if (this.hasRevealed) return { check: false, reason: 'You have already revealed.' };
		return super.canUseAction();
	}

	public get voteWeight() {
		return this.hasRevealed ? 3 : 1;
	}

}

Mayor.categories.push('Town Support');

export default Townie(Mayor);
