/* eslint-disable no-negated-condition */
import { CLIENT_ID, PGSQL_ENABLED, PREFIX } from '@root/config';
import { Phase } from '@root/lib/mafia/Game';
import { connect } from '@root/lib/orm/ormConfig';
import { floatPromise } from '@root/lib/util/utils';
import { Event, Events, PieceContext } from '@sapphire/framework';
import { TextChannel } from 'discord.js';

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

		// @ts-ignore d.js needs to be updated first
		this.client.ws.on('INTERACTION_CREATE', async interaction => {
			switch (interaction.data.name) {
				case 'invite': {
					// @ts-ignore private stuff
					await this.client.api.interactions(interaction.id, interaction.token).callback.post({
						data: {
							type: 3,
							data: {
								content: `<https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=bot&permissions=402653200>`,
								flags: 1 << 6
							}
						}
					});
				}
				case 'playerlist': {
					const channel = this.client.channels.cache.get(interaction.channel_id) as TextChannel;
					// @ts-ignore private stuff
					await this.client.api.interactions(interaction.id, interaction.token).callback.post({
						data: {
							type: 3,
							data: {
								content: channel.game ? channel.game.players.show() : 'No game is being played here.',
								flags: 1 << 6
							}
						}
					});
				}

				case 'votecount': {
					const channel = this.client.channels.cache.get(interaction.channel_id) as TextChannel;
					let content = '';

					if (!channel.game) content = 'No game is being played here.';
					else if (!channel.game.hasStarted) content = 'The game hasn\'t started yet!';
					else if (channel.game.phase !== Phase.Day) content = 'This command can be used at day only.';
					else content = channel.game.votes.show({ });
					// @ts-ignore private stuff
					await this.client.api.interactions(interaction.id, interaction.token).callback.post({
						data: {
							type: 3,
							data: {
								content,
								flags: 1 << 6
							}
						}
					});
				}
			}
		});
	}

}
