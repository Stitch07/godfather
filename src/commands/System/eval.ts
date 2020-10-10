import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, CommandOptions } from '@sapphire/framework';
import { codeBlock, isThenable } from '@sapphire/utilities';
import { Message } from 'discord.js';
import { inspect } from 'util';

@ApplyOptions<CommandOptions>({
	quotes: [],
	preconditions: ['OwnerOnly']
})
export default class extends GodfatherCommand {

	public async run(message: Message, args: Args) {
		const code = await args.restResult('string');
		if (!code.success) throw 'Missing required argument: code';

		const { result, success } = await this.eval(message, code.value, { async: args.getFlags('async') });
		const output = success
			? codeBlock('js', result)
			: `**ERROR**: ${codeBlock('bash', result)}`;
		if (args.getFlags('silent', 's')) return null;

		if (output.length > 2000) {
			if (message.channel.attachable) {
				return message.channel.send('Output was too long... sent the result as a file.', {
					files: [{ attachment: Buffer.from(output), name: 'output.txt' }]
				});
			}
			console.log(output);
			return message.channel.send('Output was too long... logged the result to console');
		}

		return message.channel.send(output);
	}

	private async eval(message: Message, code: string, flags: { async: boolean }) {
		if (flags.async) code = `(async () => {\n${code}\n})();`;
		let success = true;
		let result = null;
		try {
			// eslint-disable-next-line no-eval
			result = eval(code);
		} catch (error) {
			if (error && error.stack) this.client.logger.error(error);
			result = error;
			success = false;
		}

		if (isThenable(result)) result = await result;

		if (typeof result !== 'string') {
			result = inspect(result, {
				depth: 0,
				showHidden: false
			});
		}

		return { result, success };
	}

}
