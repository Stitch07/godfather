import GodfatherCommand, { GodfatherCommandOptions } from '@lib/GodfatherCommand';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';
import GodfatherChannel from '@lib/extensions/GodfatherChannel';

@ApplyOptions<GodfatherCommandOptions>({
	gameOnly: true,
	playerOnly: true
})
export default class extends GodfatherCommand {

	public async run(msg: KlasaMessage) {
		const { game } = msg.channel as GodfatherChannel;
		if (await game!.players.remove(game!.players.get(msg.author)!)) {
			await msg.reactions.add('✅');
		}
		return [];
	}

}
