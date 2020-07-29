import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';
import GodfatherCommand, { GodfatherCommandOptions } from '@lib/GodfatherCommand';
import GodfatherChannel from '@lib/extensions/GodfatherChannel';

@ApplyOptions<GodfatherCommandOptions>({
	description: 'Remove your vote from a player/nolynch.',
	gameOnly: true,
	gameStartedOnly: true,
	playerOnly: true,
	alivePlayerOnly: true
})
export default class extends GodfatherCommand {

	public async run(msg: KlasaMessage) {
		const { game } = msg.channel as GodfatherChannel;
		const voter = game!.players.get(msg.author)!;
		const unvoted = game!.votes.unvote(voter);

		if (unvoted) {
			await msg.reactions.add('✅');
			return [];
		}
		return msg.sendMessage('No votes to remove!');
	}

}
