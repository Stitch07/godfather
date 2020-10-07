import { ApplyOptions } from '@util/utils';
import Role from '@mafia/Role';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message, TextChannel } from 'discord.js';
import { Constructor } from '@sapphire/utilities';

@ApplyOptions<CommandOptions>({
	aliases: ['startgame'],
	description: 'Starts a game of Mafia in this server.'
})
export default class extends Command {

	public async run(msg: Message, args: Args) {
		const setup = await args.rest('string').catch(() => '');
		const { game } = msg.channel as TextChannel;

		if (setup === '') {
			// attempt to find a setup
			// TODO: prompt for multiple setups here
			const foundSetup = this.client.setups.find(setup => setup.totalPlayers === game?.players.length);
			if (!foundSetup) throw `No setups found for ${game!.players.length} players.`;
			game!.setup = foundSetup!;
		}
		await msg.channel.send(`Chose the setup **${game!.setup!.name}**. Randomizing roles...`);
		const roleGen = game!.setup!.generate();
		for (const player of game!.players) {
			player.role = new (roleGen.next().value as Constructor<Role>)(player);
			await player.sendPM();
		}
		const msgs = await msg.channel.send('Sent all role PMs!');
		if (!game!.setup!.nightStart) {
			await game!.startDay();
		}
		return msgs;
	}

}
