import GodfatherCommand, { GodfatherCommandOptions } from '@lib/GodfatherCommand';
import { ApplyOptions } from '@skyra/decorators';
import GodfatherMessage from '@lib/extensions/GodfatherMessage';
import GodfatherChannel from '@lib/extensions/GodfatherChannel';
import Role from '@mafia/Role';
import { Constructor } from '@klasa/core';

@ApplyOptions<GodfatherCommandOptions>({
	aliases: ['startgame'],
	cooldown: 5,
	description: 'Starts a game of Mafia in this server.',
	hostOnly: true,
	usage: '[setup:str]'
})
export default class extends GodfatherCommand {

	public async run(msg: GodfatherMessage, [setup = '']) {
		const { game } = msg.channel as GodfatherChannel;
		if (setup === '') {
			// attempt to find a setup
			// TODO: prompt for multiple setups here
			const foundSetup = this.client.setups.findValue(setup => setup.totalPlayers === game?.players.length);
			if (!foundSetup) throw `No setups found for ${game!.players.length} players.`;
			game!.setup = foundSetup!;
		}
		await msg.sendMessage(`Chose the setup **${game!.setup!.name}**. Randomizing roles...`);
		const roleGen = game!.setup!.generate();
		for (const player of game!.players) {
			player.role = new (roleGen.next().value as Constructor<Role>)(player);
			await player.sendPM();
		}
		const msgs = await msg.sendMessage('Sent all role PMs!');
		if (!game!.setup!.nightStart) {
			await game!.startDay();
		}
		return msgs;
	}

}
