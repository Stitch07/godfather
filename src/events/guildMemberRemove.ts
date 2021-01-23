import { Event, Events, PieceContext } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';

export default class extends Event<Events.GuildMemberRemove> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.GuildMemberRemove });
	}

	public async run(member: GuildMember) {
		const game = this.context.client.games.find((game) => Boolean(game.players.get(member.user)));
		if (game) {
			await game.players.remove(game.players.get(member.user)!, false);
		}
	}
}
