/* eslint-disable no-negated-condition */
import { CLIENT_ID, PGSQL_ENABLED, PREFIX } from '@root/config';
import { connect } from '@root/lib/orm/ormConfig';
import { floatPromise, pluralize } from '@root/lib/util/utils';
import { Event, Events, isErr, PieceContext } from '@sapphire/framework';

export default class extends Event<Events.Ready> {

	public constructor(context: PieceContext) {
		super(context, { event: Events.Ready });
	}

	public async run() {
		if (this.context.client.ownerID === undefined) {
			const application = await this.context.client.fetchApplication();
			this.context.client.ownerID = application.owner?.id;
		}
		await this.context.client.user!.setPresence({
			activity: {
				type: 'LISTENING',
				name: `${PREFIX}help`
			}
		});
		if (PGSQL_ENABLED) floatPromise(this.context.client, connect());

		// start event loop
		this.context.client.eventLoop = setInterval(async () => {
			for (const game of this.context.client.games.values()) await game.update();
		}, 10 * 1000); // 10 seconds

		this.context.client.logger.info(`Ready! Logged in as ${this.context.client.user!.tag} and connected to ${pluralize(this.context.client.guilds.cache.size, 'guild')}.`);

		for (const command of this.context.client.slashCommands.values()) {
			// @ts-ignore more private calls until d.js supports interactions
			await this.context.client.api.applications(CLIENT_ID).commands.post({
				data: {
					name: command.name,
					description: command.description
				}
			});
		}

		// @ts-ignore d.js needs to be updated first
		this.context.client.ws.on('INTERACTION_CREATE', async interaction => {
			const command = this.context.client.slashCommands.get(interaction.data.name);
			if (!command) return null;

			const fauxMessage = { channel: this.context.client.channels.cache.get(interaction.channel_id)!, guild: this.context.client.channels.cache.get(interaction.channel_id)! };
			// @ts-ignore more hacks with faux messages
			const result = await command.preconditions.run(fauxMessage, command);
			if (isErr(result) && result.error.message !== '') {
				return command.reply(interaction, result.error.message);
			}

			try {
				await command.run(interaction);
			} catch (error) {
				if (typeof error === 'string') return command.reply(interaction, error);
				this.context.client.logger.error(error);
			}
		});
	}

}
