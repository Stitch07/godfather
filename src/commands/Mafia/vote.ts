import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';
import GodfatherCommand, { GodfatherCommandOptions } from '@lib/GodfatherCommand';
import GodfatherChannel from '@lib/extensions/GodfatherChannel';
import Player from '@mafia/Player';

@ApplyOptions<GodfatherCommandOptions>({
	aliases: ['vtl', 'vt'],
	description: 'Vote to lynch a player',
	usage: '<target:player>',
	gameOnly: true,
	gameStartedOnly: true,
	playerOnly: true,
	alivePlayerOnly: true
})
export default class extends GodfatherCommand {

	public async run(msg: KlasaMessage, [target]: [Player]) {
		const { game } = msg.channel as GodfatherChannel;

		const voter = game!.players.get(msg.author)!;
		const hammered = game!.votes.vote(voter, target);

		await (msg.channel as GodfatherChannel).sendMessage(`Voted ${target.user.tag}.`);
		if (hammered) {
			if (typeof target.role?.onLynch === 'function') {
				await target.role?.onLynch();
			}
			return (msg.channel as GodfatherChannel).sendMessage(`**${target.user.tag}** has been lynched.\nThey were a **${target.role?.faction.name} ${target.role?.name}**.`);
		}
		return [];
	}

}