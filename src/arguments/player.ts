import { Argument, Possible } from 'klasa';
import { Message, User } from '@klasa/core';
import GodfatherChannel from '@lib/extensions/GodfatherChannel';
import Player from '@mafia/Player';

export default class extends Argument {

	public async run(argument: string, possible: Possible, message: Message) {
		const { game } = message.channel as GodfatherChannel;

		const resolved = Player.resolve(game!, argument);
		if (resolved) return resolved;

		const user = await (this.store.get('username')! as Argument).run(argument, possible, message);
		const player = game!.players.get(user as User);

		if (player) return player;
		throw 'Invalid player.';
	}

}