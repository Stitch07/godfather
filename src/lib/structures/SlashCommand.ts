import { Awaited, BasePiece, PieceContext, PreconditionContainerAll, PreconditionContainerResolvable } from '@sapphire/framework';
import { PieceOptions } from '@sapphire/pieces';

export default abstract class SlashCommand extends BasePiece {

	public description: string;

	public preconditions: PreconditionContainerAll;

	public constructor(context: PieceContext, options: SlashCommandOptions) {
		super(context, options);

		this.description = options.description;
		this.preconditions = new PreconditionContainerAll(this.client, options.preconditions ?? []);
	}

	public abstract run(interaction: any): Awaited<any>;

	public async reply(interaction: any, content: string, options: SlashCommandReplyOptions = { hidden: true }) {
		// @ts-ignore private stuff
		await this.client.api.interactions(interaction.id, interaction.token).callback.post({
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
