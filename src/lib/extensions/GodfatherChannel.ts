import { extender, ReactionCollector, User } from '@klasa/core';
import Godfather from '@lib/Godfather';

export default class GodfatherChannel extends extender.get('TextChannel') {

	public sendMessage(content: string) {
		return this.send(mb => mb.setContent(content));
	}

	public get game() {
		return (this.client as Godfather).games.get(this.id);
	}

	public async prompt(promptMessage: string, promptUser: User): Promise<boolean> {
		const [msg] = await this.sendMessage(promptMessage);
		await msg!.reactions.add('🇾');
		await msg!.reactions.add('🇳');
		const collector = new ReactionCollector(msg, {
			filter: ([reaction, user]) => user.id === promptUser.id
				&& ['🇾', '🇳'].includes(reaction.emoji.toString()),
			limit: 1,
			idle: 30 * 1000
		});
		const reaction = await collector.collect()
			.then(reactions => reactions.firstKey ?? '🇳');
		return reaction === '🇾';
	}

}
