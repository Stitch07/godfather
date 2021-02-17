import { SENTRY_DSN } from '@root/config';
import { ArgumentError, CommandErrorPayload, Event, Events, PieceContext } from '@sapphire/framework';
import * as Sentry from '@sentry/node';
import { DiscordAPIError, HTTPError } from 'discord.js';

// unknown channel
const IGNORED_CODES = [10001];

export default class extends Event<Events.CommandError> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.CommandError });
	}

	public run(error: unknown, { message, piece: command }: CommandErrorPayload) {
		if (typeof error === 'string') return message.channel.send(error);
		if (error instanceof ArgumentError) {
			return message.channel.sendTranslated(`arguments:${error.identifier}`, [
				{ parameter: error.parameter, ...(error.context as Record<string, unknown>) }
			]);
		}
		if (SENTRY_DSN) {
			if ((error instanceof DiscordAPIError || error instanceof HTTPError) && IGNORED_CODES.includes(error.code)) return;
			Sentry.captureException(error, {
				tags: {
					command: command.name
				},
				user: {
					id: message.author.id,
					username: message.author.username
				}
			});
		} else {
			this.context.client.logger.error(error);
		}
	}
}
