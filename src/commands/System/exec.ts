import GodfatherCommand from '#lib/GodfatherCommand';
import { exec } from '#root/lib/util/utils';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, CommandOptions } from '@sapphire/framework';
import { codeBlock } from '@sapphire/utilities';
import { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	quotes: [],
	preconditions: ['OwnerOnly']
})
export default class extends GodfatherCommand {

	public async run(message: Message, args: Args) {
		const code = await args.rest('string')
			.catch(() => { throw 'Missing required argument: code'; });
		const timeout = Number.isInteger(args.getOption('timeout')) ? Number(args.getOption('timeout')) : 0;

		const { stdout, stderr } = await exec(code, { timeout });
		const output = stdout ? `**OUTPUT**:${codeBlock('prolog', stdout)}` : '';
		const error = stderr ? `**ERROR**:${codeBlock('prolog', stderr)}` : '';
		const outText = [output, error].join('\n');

		if (outText.length < 2000) return message.channel.send(outText);
		return message.channel.send({ files: [{ attachment: Buffer.from(outText), name: 'output.txt' }] });
	}

}
