import { Argument, ArgumentContext, AsyncArgumentResult } from '@sapphire/framework';
import { User } from 'discord.js';

const USER_REGEX = /^(?:<@!?)?(\d{17,19})>?$/;

export default class extends Argument<User> {

	public async run(argument: string, { message }: ArgumentContext): AsyncArgumentResult<User> {
		const user = USER_REGEX.test(argument) ? USER_REGEX.exec(argument)![1] : null;
		if (user) return this.ok(await this.context.client.users.fetch(user));

		const members = await message.guild!.members.fetch({ query: argument });
		if (members.size > 0) return this.ok(members.first()!.user);
		return this.error(argument, 'InvalidUserError', 'The argument did not resolve to a valid user.');
	}

}
