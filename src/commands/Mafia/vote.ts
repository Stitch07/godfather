import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';
import GodfatherCommand, { GodfatherCommandOptions } from '@lib/GodfatherCommand';
import GodfatherChannel from '@lib/extensions/GodfatherChannel';
import Player from '@mafia/Player';

@ApplyOptions<GodfatherCommandOptions>({
	aliases: ['vtl', 'vt'],
	description: 'Vote to lynch a player',
	usage: '[player:player]',
	gameOnly: true,
	gameStartedOnly: true,
	playerOnly: true,
	alivePlayerOnly: true
})
export default class extends GodfatherCommand {

	public async run(msg: KlasaMessage) {
		const { game } = msg.channel as GodfatherChannel;
		let target:Player = game!.players[0];
		let userId:string = msg.args[1] as string;
		userId = userId.substring(3, userId.length - 1);
		
		for (let i = 0; i < game!.players.length; i++) {
			if (game!.players[i].user.id == userId) {
				target = game!.players[i];
			}
		}

		console.log("game: " + game);
		console.log("message args: " + msg.args);
		console.log("player list: " + game?.players);
		const voter = game!.players.get(msg.author)!;
		const hammered = game!.votes.vote(voter, target);
		await (msg.channel as GodfatherChannel).sendMessage(`Voted ${target.user.tag}.`);
		if (hammered) {
			return (msg.channel as GodfatherChannel).sendMessage('Hammered?');
		}
		return [];
	}

}
