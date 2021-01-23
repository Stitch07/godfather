/* eslint-disable no-negated-condition */
import { connect } from '@lib/orm/ormConfig';
import { CLIENT_ID, PGSQL_ENABLED, PREFIX, SENTRY_DSN } from '@root/config';
import { Event, Events, isErr, PieceContext, Store } from '@sapphire/framework';
import * as Sentry from '@sentry/node';
import { floatPromise } from '@util/utils';
import { gray, green, magenta, yellow } from 'colorette';

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
			for (const game of this.context.client.games.values()) {
				try {
					await game.update();
				} catch (error) {
					if (SENTRY_DSN) {
						Sentry.captureException(error, {
							tags: {
								game: game.channel.id
							},
							contexts: {
								game: game.toJSON(),
								action: {
									type: 'phase_update'
								}
							}
						});
					} else {
						this.context.client.logger.error(error);
					}
				}
			}
		}, 10 * 1000); // 10 seconds

		for (const command of this.context.client.slashCommands.values()) {
			// @ts-ignore more private calls until d.js supports interactions
			await this.context.client.api.applications(CLIENT_ID).commands.post({
				data: {
					name: command.name,
					description: command.description
				}
			});
		}

		this.logReady();

		// @ts-ignore d.js needs to be updated first
		this.context.client.ws.on('INTERACTION_CREATE', async (interaction) => {
			const command = this.context.client.slashCommands.get(interaction.data.name);
			if (!command) return null;

			const fauxMessage = {
				channel: this.context.client.channels.cache.get(interaction.channel_id)!,
				guild: this.context.client.channels.cache.get(interaction.channel_id)!
			};
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

	private logReady() {
		const { logger } = this.context.client;
		logger.info(`${this.header} ${this.tag} ${this.guilds} ${this.users}`);
		this.logStoreInformation();
	}

	private get header() {
		return `${yellow(`Godfather ${this.context.client.version}`)} ready!`;
	}

	private get tag() {
		const { tag } = this.context.client.user!;
		return `[ ${green(tag)} ]`;
	}

	private get guilds() {
		const count = this.context.client.guilds.cache.size.toString();
		return `[ ${magenta(count)} [G] ]`;
	}

	private get users() {
		const count = this.context.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toString();
		return `[ ${magenta(count)} [U] ]`;
	}

	private logStoreInformation() {
		const { logger } = this.context.client;
		const stores = [...this.context.client.stores.values()];
		const last = stores.pop()!;

		for (const store of stores) logger.debug(this.styleStore(store, false));
		logger.debug(this.styleStore(last, true));
	}

	private styleStore(store: Store<any>, last: boolean) {
		return gray(`${last ? '└─' : '├─'} Loaded ${yellow(store.size.toString())} ${store.name}`);
	}
}
