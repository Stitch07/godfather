import { Argument, ArgumentContext, AsyncArgumentResult } from '@sapphire/framework';
import type { User } from 'discord.js';

const USER_REGEX = /^(?:<@!?)?(\d{17,19})>?$/;

export default class extends Argument<User> {
	public async run(parameter: string, { message }: ArgumentContext): AsyncArgumentResult<User> {
		const user = USER_REGEX.test(parameter) ? USER_REGEX.exec(parameter)![1] : null;
		if (user) return this.ok(await this.context.client.users.fetch(user));

		const members = await message.guild!.members.fetch({ query: parameter });
		if (members.size > 0) return this.ok(members.first()!.user);
		return this.error({
			identifier: 'InvalidUserError',
			message: 'The argument did not resolve to a valid user.',
			parameter
		});
	}
}
