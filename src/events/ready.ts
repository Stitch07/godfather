/* eslint-disable no-negated-condition */
import { CLIENT_ID, PGSQL_ENABLED, PREFIX } from '@root/config';
import { connect } from '@root/lib/orm/ormConfig';
import { floatPromise } from '@root/lib/util/utils';
import { Event, Events, isErr, PieceContext } from '@sapphire/framework';

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
		if (PGSQL_ENABLED) floatPromise(this.client, connect());

		// start event loop
		this.client.eventLoop = setInterval(async () => {
			for (const game of this.client.games.values()) await game.update();
		}, 10 * 1000); // 10 seconds

		this.client.logger.info(`Ready! Logged in as ${this.client.user!.tag} and connected to ${this.client.guilds.cache.size} guilds.`);

		for (const command of this.client.slashCommands.values()) {
			// @ts-ignore more private calls until d.js supports interactions
			await this.client.api.applications(CLIENT_ID).commands.post({
				data: {
					name: command.name,
					description: command.description
				}
			});
		}
		this.client.logger.info(`Loaded ${this.client.slashCommands.size} slash-commands.`);

		// @ts-ignore d.js needs to be updated first
		this.client.ws.on('INTERACTION_CREATE', async interaction => {
			const command = this.client.slashCommands.get(interaction.data.name);
			if (!command) return null;

			const fauxMessage = { channel: this.client.channels.cache.get(interaction.channel_id)!, guild: this.client.channels.cache.get(interaction.channel_id)! };
			// @ts-ignore more hacks with faux messages
			const result = await command.preconditions.run(fauxMessage, command);
			if (isErr(result) && result.error.message !== '') {
				return command.reply(interaction, result.error.message);
			}

			try {
				await command.run(interaction);
			} catch (error) {
				if (typeof error === 'string') return command.reply(interaction, error);
				this.client.logger.error(error);
			}
		});
	}

}
