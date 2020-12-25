import { Awaited, Piece, PieceContext, PreconditionContainerAll, PreconditionContainerResolvable } from '@sapphire/framework';
import { PieceOptions } from '@sapphire/pieces';

export default abstract class SlashCommand extends Piece {

	public description: string;

	public preconditions: PreconditionContainerAll;

	public constructor(context: PieceContext, options: SlashCommandOptions) {
		super(context, options);

		this.description = options.description;
		this.preconditions = new PreconditionContainerAll(this.context.client, options.preconditions ?? []);
	}

	public abstract run(interaction: any): Awaited<any>;

	public async reply(interaction: any, content: string, options: SlashCommandReplyOptions = { hidden: true }) {
		// @ts-ignore private stuff
		await this.context.client.api.interactions(interaction.id, interaction.token).callback.post({
			data: {
				type: 3,
				data: {
					content,
					flags: options.hidden ? 1 << 6 : undefined
				}
			}
		});
	}

}

export interface SlashCommandOptions extends PieceOptions {
	description: string;
	preconditions?: PreconditionContainerResolvable;
}

export interface SlashCommandReplyOptions {
	hidden?: boolean;
}
