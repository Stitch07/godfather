import { CommandDeniedPayload, Event, Events, PieceContext, UserError } from '@sapphire/framework';

export default class extends Event<Events.CommandDenied> {

	public constructor(context: PieceContext) {
		super(context, { event: Events.CommandDenied });
	}

	public run(error: UserError, { message }: CommandDeniedPayload) {
		// silently fail owner only commands
		if (error.identifier === 'OwnerOnly' || error.message === '') return null;
		return message.channel.send(error.message);
	}

}
