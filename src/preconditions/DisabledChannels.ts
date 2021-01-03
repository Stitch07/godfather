import { PGSQL_ENABLED } from '@root/config';
import { cast } from '@root/lib/util/utils';
import { Command, isErr, Precondition, PreconditionContext } from '@sapphire/framework';
import { Message } from 'discord.js';

export default class extends Precondition {

	public async run(message: Message, command: Command, context: PreconditionContext) {
		if (!message.guild || !PGSQL_ENABLED) return this.ok();

		const { disabledChannels } = await message.guild.readSettings();
		const adminCheck = await cast<Precondition>(this.store.get('AdminOnly')!).run(message, command, context);

		if (disabledChannels.includes(message.channel.id) && isErr(adminCheck)) return this.error(this.name, '');
		return this.ok();
	}

}
