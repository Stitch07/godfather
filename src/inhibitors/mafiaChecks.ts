import { Inhibitor, KlasaMessage } from 'klasa';
import GodfatherCommand from '@lib/GodfatherCommand';
import GodfatherChannel from '@lib/extensions/GodfatherChannel';

export default class extends Inhibitor {

	public run(msg: KlasaMessage, command: GodfatherCommand) {
		const { game } = msg.channel as GodfatherChannel;
		if (command.gameOnly && !game) throw 'A game of Mafia is not running in this channel.';
		if (command.gameStartedOnly && !game!.hasStarted) throw 'The game hasn\'t started yet!';
		if (command.playerOnly && !game!.players.get(msg.author)) throw 'This command is player-only.';
		if (command.hostOnly && game!.host !== msg.author) throw 'This command is host-only.';

		if (command.alivePlayerOnly) {
			const player = game!.players.get(msg.author);
			if (!player!.isAlive) throw 'Dead players cannot use this command.';
		}
	}

}
