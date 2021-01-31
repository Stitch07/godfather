import type { Args, CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '@lib/GodfatherCommand';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['maint'],
	preconditions: ['OwnerOnly'],
	description: 'Manages maintenance.',
	detailedDescription: [
		'This command has a subcommand: `status`. It shows the current maintenance setting.',
		'If used without the subcommand, it toggles the maintenance status.'
	].join(' ')
})
export default class extends GodfatherCommand {
	public async run(message: Message, args: Args) {
		const subcommand = args.finished ? null : (await args.rest('string')).trim().toLowerCase();
		const status = this.context.client.maintenance;

		if (subcommand === 'status') return message.channel.send(`Maintenance is ${status ? 'enabled' : 'disabled'}.`);

		this.context.client.maintenance = !status;
		await message.channel.send(`${status ? 'Disabled' : 'Enabled'} maintenance.`);
	}
}
