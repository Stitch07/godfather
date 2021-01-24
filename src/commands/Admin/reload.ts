import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['r'],
	preconditions: ['OwnerOnly']
})
export default class extends GodfatherCommand {
	public async run(message: Message, args: Args) {
		const piece = await args.pickResult('piece');
		if (!piece.success) throw 'Missing required argument: piece';

		await piece.value.reload();
		return message.channel.send(`✅ Reloaded ${piece.value.store.name.slice(0, -1)}: ${piece.value.name}`);
	}
}
