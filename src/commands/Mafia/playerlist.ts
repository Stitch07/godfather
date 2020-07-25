import GodfatherCommand, { GodfatherCommandOptions } from '@lib/GodfatherCommand';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';
import GodfatherChannel from '@lib/extensions/GodfatherChannel';

@ApplyOptions<GodfatherCommandOptions>({
	aliases: ['players', 'pl'],
	description: 'Shows the playerlist of an ongoing game.',
	gameOnly: true
})
export default class extends GodfatherCommand {

	public run(msg: KlasaMessage) {
		const { game } = msg.channel as GodfatherChannel;
		return msg.sendMessage(game!.players.show());
	}

}
