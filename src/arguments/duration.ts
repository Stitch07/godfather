import { format } from '@root/lib/util/durationFormat';
import { Argument, ArgumentContext, ArgumentResult } from '@sapphire/framework';
import { Duration } from '@sapphire/time-utilities';

export default class extends Argument<number> {
	public run(parameter: string, context: ArgumentContext): ArgumentResult<number> {
		const { offset } = new Duration(parameter);

		if (typeof context.minimum === 'number' && offset < context.minimum) {
			return this.error({
				parameter,
				identifier: 'ArgumentDurationMinimumDuration',
				message: `The duration must be at least ${format(context.minimum)}.`
			});
		}
		if (typeof context.maximum === 'number' && offset > context.maximum) {
			return this.error({
				identifier: 'ArgumentDurationMaximumDuration',
				message: `The duration can be at most ${format(context.maximum)}.`,
				parameter
			});
		}

		return this.ok(offset);
	}
}
