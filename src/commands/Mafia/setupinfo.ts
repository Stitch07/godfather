import { Args, BucketType, CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { codeBlock } from '@sapphire/utilities';
import GodfatherCommand from '@lib/GodfatherCommand';
import { enumerate } from '@util/utils';
import { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['setups'],
	preconditions: [{ entry: 'Cooldown', context: { type: BucketType.Channel, delay: 5000 } }]
})
export default class extends GodfatherCommand {

	public async run(message: Message, args: Args) {
		const setupName = await args.restResult('string');
		if (setupName.success || message.channel.game?.setup) {
			if (setupName.success && !this.client.setups.has(setupName.value)) throw `I couldn't find a setup named "${setupName.value}"`;
			const setup = setupName.success ? this.client.setups.get(setupName.value.toLowerCase())! : message.channel.game!.setup!;
			const output = [
				`= ${setup.name} - ${setup.totalPlayers} players`,
				`* Description: ${setup.description ?? 'No description available'}`,
				''
			];
			if (setup.roles.length) {
				output.push('Roles:');
				for (const [i, role] of enumerate(setup.roles)) {
					// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
					output.push(`${i + 1}. ${role}`);
				}
			}
			return message.channel.send(codeBlock('asciidoc', output.join('\n')));
		}

		const prefix = await this.client.fetchPrefix(message);
		const setups = this.client.setups.sort((a, b) => a.totalPlayers - b.totalPlayers).map(setup => `${setup.name} ${setup.roles.length ? `(${setup.totalPlayers} players)` : ''}`);
		return message.channel.send([
			`**All available setups**: (to view a specific setup, use ${Array.isArray(prefix) ? prefix[0] : prefix}setupinfo <name>)`,
			codeBlock('', setups.join('\n'))
		].join('\n'));
	}

}
