import { Event, Events, PieceContext } from '@sapphire/framework';

export default class extends Event<Events.Ready> {

	public constructor(context: PieceContext) {
		super(context, { event: Events.Ready });
	}

	public async run() {
		if (this.client.ownerID === undefined) {
			const application = await this.client.fetchApplication();
			this.client.ownerID = application.owner?.id;
		}
		this.client.logger.info(`Ready! Logged in as ${this.client.user!.tag} and connected to ${this.client.guilds.cache.size} guilds.`);
	}

}
