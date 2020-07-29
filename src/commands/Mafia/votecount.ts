import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';
import GodfatherCommand, { GodfatherCommandOptions } from '@lib/GodfatherCommand';
import GodfatherChannel from '@lib/extensions/GodfatherChannel';

@ApplyOptions<GodfatherCommandOptions>({
	aliases: ['vc'],
	description: 'Shows the current vote count.',
	gameOnly: true,
	gameStartedOnly: true
})
export default class extends GodfatherCommand {

	public async run(msg: KlasaMessage) {
		const { game } = msg.channel as GodfatherChannel;
		return msg.sendMessage(game!.votes.show());
	}

}
