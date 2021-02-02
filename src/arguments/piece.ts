import { Argument, ArgumentResult, Piece } from '@sapphire/framework';

export default class extends Argument<Piece> {
	public run(parameter: string): ArgumentResult<Piece> {
		for (const store of this.context.client.stores.values()) {
			if (store.has(parameter)) return this.ok(store.get(parameter)!);
		}

		return this.error({
			identifier: 'ArgumentPieceInvalidPiece',
			message: 'Invalid piece',
			parameter
		});
	}
}
