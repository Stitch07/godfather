import GodfatherCommand, { GodfatherCommandOptions } from '@lib/GodfatherCommand';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';
import GodfatherChannel from '@lib/extensions/GodfatherChannel';
import Player from '@mafia/Player';

@ApplyOptions<GodfatherCommandOptions>({
	aliases: ['in'],
	description: 'Adds you to the playerlist of an ongoing game.',
	gameOnly: true
})
export default class extends GodfatherCommand {

	public run(msg: KlasaMessage) {
		const { game } = msg.channel as GodfatherChannel;
		if (game!.players.find(player => player.user.id === msg.author.id)) {
			throw 'You have already joined.';
		}
		if (game!.hasStarted) {
			// do replacements here sometime
		}
		game!.players.push(new Player(msg.author, game!));
		return msg.sendMessage('✅ Successfully joined.');
	}

}
