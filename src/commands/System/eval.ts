import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args, CommandOptions } from '@sapphire/framework';
import { Type } from '@sapphire/type';
import { codeBlock, isThenable } from '@sapphire/utilities';
import { DbSet } from '@lib/database/DbSet';
import { clean, handleRequiredArg } from '@util/utils';
import type { Message } from 'discord.js';
import { inspect } from 'util';

@ApplyOptions<CommandOptions>({
	aliases: ['ev'],
	quotes: [],
	preconditions: ['OwnerOnly'],
	strategyOptions: {
		flags: ['async', 'hidden', 'showHidden', 'silent', 's', 'sql'],
		options: ['depth']
	}
})
export default class extends GodfatherCommand {
	public async run(message: Message, args: Args) {
		const code = await args.rest('string').catch(handleRequiredArg('code'));
		const executeSql = await args.getFlags('sql');

		const { result, success, type } = executeSql
			? await this.sql(code)
			: await this.eval(message, code, {
					async: args.getFlags('async'),
					depth: Number(args.getOption('depth')) ?? 0,
					showHidden: args.getFlags('hidden', 'showHidden')
			  });
		const output = clean(success ? codeBlock('js', result) : `**ERROR**: ${codeBlock('bash', result)}`);
		if (args.getFlags('silent', 's')) return null;

		const typeFooter = executeSql ? '' : `**Type**: ${codeBlock('typescript', type)}`;

		if (output.length > 2000) {
			if (message.channel.attachable) {
				return message.channel.send(`Output was too long... sent the result as a file.\n\n${typeFooter}`, {
					files: [{ attachment: Buffer.from(output), name: 'output.txt' }]
				});
			}
			console.log(output);
			return message.channel.send(`Output was too long... logged the result to console\n\n${typeFooter}`);
		}

		return message.channel.send(`${output}\n${typeFooter}`);
	}

	private async eval(message: Message, code: string, flags: { async: boolean; depth: number; showHidden: boolean }) {
		if (flags.async) code = `(async () => {\n${code}\n})();`;
		let success = true;
		let result = null;
		try {
			// eslint-disable-next-line no-eval
			result = eval(code);
		} catch (error) {
			if (error && error.stack) {
				this.context.client.logger.error(error);
			}
			result = error;
			success = false;
		}

		const type = new Type(result).toString();
		if (isThenable(result)) result = await result;

		if (typeof result !== 'string') {
			result = inspect(result, {
				depth: flags.depth,
				showHidden: flags.showHidden
			});
		}

		return { result, success, type };
	}

	private async sql(code: string) {
		let success = true;
		let result = null;
		try {
			result = inspect(await DbSet.instance?.connection.query(code), { depth: 2 });
			success = true;
		} catch (error) {
			if (error && error.stack) {
				this.context.client.logger.error(error);
			}
			result = error;
			success = false;
		}

		return { result, success, type: null };
	}
}
