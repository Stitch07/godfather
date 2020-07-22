import { Inhibitor, KlasaMessage } from 'klasa';
import GodfatherCommand from '@lib/GodfatherCommand';
import GodfatherChannel from '@lib/extensions/GodfatherChannel';

export default class extends Inhibitor {

	public run(msg: KlasaMessage, command: GodfatherCommand) {
		if (command.gameOnly && !(msg.channel as GodfatherChannel).game) {
			throw 'A game of Mafia is not running in this channel.';
		}
	}

}
