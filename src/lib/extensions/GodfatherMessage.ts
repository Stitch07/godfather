import { extender, ReactionCollector } from '@klasa/core';

export default class GodfatherMessage extends extender.get('Message') {

	public sendMessage(content: string) {
		return this.reply(mb => mb.setContent(content));
	}

	public async prompt(promptMessage: string): Promise<boolean> {
		const [msg] = await this.channel.send(mb => mb.setContent(promptMessage));
		await msg!.reactions.add('🇾');
		await msg!.reactions.add('🇳');
		const collector = new ReactionCollector(msg, {
			filter: ([reaction, user]) => user.id === this.author.id
				&& ['🇾', '🇳'].includes(reaction.emoji.toString()),
			limit: 1,
			idle: 30 * 1000
		});
		const reaction = await collector.collect()
			.then(reactions => reactions.firstKey ?? '🇳');
		return reaction === '🇾';
	}

}
