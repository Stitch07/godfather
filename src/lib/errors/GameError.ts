export class GameError extends Error {
	public constructor(public identifier: string, public context: Record<string, unknown> = {}) {
		super('A GameError occurred.');
	}
}
