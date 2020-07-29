import { Argument, Possible } from 'klasa';
import { Message, User } from '@klasa/core';
import GodfatherChannel from '@lib/extensions/GodfatherChannel';

export default class extends Argument {

	public run(argument: string, possible: Possible, message: Message) {
		const { game } = message.channel as GodfatherChannel;
		if (Number.isInteger(parseInt(argument, 10)) && Number(argument) > 0 && Number(argument) < game!.players.length) {
			return game!.players[Number(argument) - 1];
		}
		const user = (this.store.get('username')! as Argument).run(argument, possible, message);
		const player = game!.players.get(user as User);
		if (player) return player;
		throw 'Invalid player.';
	}

}
