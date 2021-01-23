import { Event, PieceContext } from '@sapphire/framework';

export default class extends Event {
	public constructor(context: PieceContext) {
		super(context, { event: 'unhandledRejection', emitter: process });
	}

	public run(error: Error) {
		if (error) this.context.client.logger.error('Uncaught Promise Error: ', error);
	}
}
