import { Argument, ArgumentContext, AsyncArgumentResult, Identifiers } from '@sapphire/framework';
import type { User } from 'discord.js';

const USER_REGEX = /^(?:<@!?)?(\d{17,19})>?$/;

export default class extends Argument<User> {
	public async run(parameter: string, context: ArgumentContext): AsyncArgumentResult<User> {
		const user = USER_REGEX.test(parameter) ? USER_REGEX.exec(parameter)![1] : null;
		if (user) return this.ok(await this.context.client.users.fetch(user));

		const members = await context.message.guild!.members.fetch({ query: parameter });
		if (members.size > 0) return this.ok(members.first()!.user);
		return this.error({
			identifier: Identifiers.ArgumentUser,
			parameter,
			context
		});
	}
}
