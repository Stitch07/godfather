import { CommandErrorPayload, Event, Events, PieceContext } from '@sapphire/framework';

export default class extends Event<Events.CommandError> {

	public constructor(context: PieceContext) {
		super(context, { event: Events.CommandError });
	}

	public run(error: unknown, { message }: CommandErrorPayload) {
		if (typeof error === 'string') return message.channel.send(error);
		this.client.logger.error(error);
	}

}
