import { Event, Events, PieceContext } from '@sapphire/framework';

export default class extends Event<Events.GuildCreate> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.GuildCreate });
	}

	public async run() {
		await this.context.client.uploadBotStats();
	}
}
