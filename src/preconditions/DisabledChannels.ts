import { PGSQL_ENABLED } from '@root/config';
import { DbSet } from '@lib/database/DbSet';
import { cast } from '@lib/util/utils';
import { Command, isErr, Precondition, PreconditionContext } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class extends Precondition {
	public async run(message: Message, command: Command, context: PreconditionContext) {
		if (!message.guild || !PGSQL_ENABLED) return this.ok();

		const { guilds } = await DbSet.connect();
		const disabledChannels =
			(await guilds.findOne(message.guild.id, { select: ['id', 'disabledChannels'] }).then((settings) => settings?.disabledChannels)) ?? [];
		const adminCheck = await cast<Precondition>(this.store.get('AdminOnly')!).run(message, command, context);

		if (disabledChannels.includes(message.channel.id) && isErr(adminCheck)) return this.error({ message: '' });
		return this.ok();
	}
}
