import { Command, CommandOptions, PieceContext } from '@sapphire/framework';
import { sep } from 'path';

export default abstract class GodfatherCommand extends Command {

	public constructor(context: PieceContext, options: CommandOptions) {
		options.preconditions = Array.isArray(options.preconditions) ? ['DisabledChannels', ...options.preconditions] : ['DisabledChannels'];
		super(context, options);
	}

	public get category() {
		return this.path.split(sep).reverse()[1] ?? 'General';
	}

}
