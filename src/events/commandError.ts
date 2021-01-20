import { SENTRY_DSN } from '@root/config';
import { CommandErrorPayload, Event, Events, PieceContext, UserError } from '@sapphire/framework';
import * as Sentry from '@sentry/node';

export default class extends Event<Events.CommandError> {

	public constructor(context: PieceContext) {
		super(context, { event: Events.CommandError });
	}

	public run(error: unknown, { message, piece: command }: CommandErrorPayload) {
		if (typeof error === 'string') return message.channel.send(error);
		if (error instanceof UserError && error.message !== '') return message.channel.send(error.message);
		if (SENTRY_DSN) {
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
