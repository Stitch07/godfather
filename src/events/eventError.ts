import { Event, Events, PieceContext } from '@sapphire/framework';

export default class extends Event<Events.EventError> {

	public constructor(context: PieceContext) {
		super(context, { event: Events.EventError });
	}

	public run(error: unknown) {
		this.context.client.logger.error(error);
	}

}
