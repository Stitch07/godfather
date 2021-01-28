import { Event, Events, PieceContext } from '@sapphire/framework';
import type { Guild } from 'discord.js';

export default class extends Event<Events.GuildDelete> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.GuildDelete });
	}

	public async run(guild: Guild) {
		await this.context.client.uploadBotStats();
		for (const channel of guild.channels.cache.values()) {
			await this.context.client.games.delete(channel.id);
		}
	}
}
