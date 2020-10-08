import { PREFIX } from '@root/config';
import { connect } from '@root/lib/orm/ormConfig';
import { floatPromise } from '@root/lib/util/utils';
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
		await this.client.user!.setPresence({
			activity: {
				type: 'LISTENING',
				name: `${PREFIX}help`
			}
		});
		// load db
		floatPromise(this.client, connect());
		this.client.logger.info(`Ready! Logged in as ${this.client.user!.tag} and connected to ${this.client.guilds.cache.size} guilds.`);
	}

}
