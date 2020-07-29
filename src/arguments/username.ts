// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.
import { Argument, Possible } from 'klasa';
import { GuildMember, Message, User, Guild } from '@klasa/core';
import { regExpEsc } from '@klasa/utils';

const USER_REGEXP = Argument.regex.userOrMember;

function resolveUser(query: string | GuildMember | User, guild: Guild) {
	if (query instanceof GuildMember) return query.user;
	if (query instanceof User) return query;
	if (typeof query === 'string') {
		if (USER_REGEXP.test(query)) return guild.client.users.fetch(USER_REGEXP.exec(query)![1]).catch(() => null);
		if (/\w{1,32}#\d{4}/.test(query)) {
			const res = guild.members.findValue(member => member.user!.tag === query);
			return res ? res.user! : null;
		}
	}
	return null;
}

export default class extends Argument {

	public async run(arg: string, possible: Possible, msg: Message) {
		if (!msg.guild) return (this.store.get('user') as Argument)!.run(arg, possible, msg);
		const resUser = await resolveUser(arg, msg.guild);
		if (resUser) return resUser;

		const results = [];
		const reg = new RegExp(regExpEsc(arg), 'i');
		for (const member of msg.guild.members.values()) {
			if (reg.test(member.user!.username)) results.push(member.user);
		}

		let querySearch = null;
		if (results.length > 0) {
			const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, 'i');
			const filtered = results.filter(user => regWord.test(user!.username));
			querySearch = filtered.length > 0 ? filtered : results;
		} else {
			querySearch = results;
		}

		switch (querySearch.length) {
			case 0: throw `${possible.name} Must be a valid name, id or user mention`;
			case 1: return querySearch[0];
			default: throw `Found multiple matches: \`${querySearch.map(user => user!.tag).join('`, `')}\``;
		}
	}

}
