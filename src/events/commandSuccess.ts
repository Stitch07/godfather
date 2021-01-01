import { CommandSuccessPayload, Event, Events, PieceContext } from '@sapphire/framework';
import { bold, greenBright } from 'colorette';

export default class extends Event<Events.CommandSuccess> {

	public constructor(context: PieceContext) {
		super(context, { event: Events.CommandSuccess });
	}

	public run({ message, command, parameters }: CommandSuccessPayload) {
		const guildName = message.guild ? `${message.guild.name} [${message.guild.id}]` : 'Direct Messages';
		this.context.client.logger.debug(`${bold(greenBright(command.name))}(${parameters}) used by ${message.author.tag} [${message.author.id}] in ${guildName}.`);
	}

}
