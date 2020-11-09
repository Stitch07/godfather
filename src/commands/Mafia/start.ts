import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '@lib/GodfatherCommand';
import { Args, CommandOptions } from '@sapphire/framework';
import { Message, TextChannel } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['startgame'],
	description: 'Starts a game of Mafia in this server.',
	preconditions: ['GuildOnly', 'GameOnly', 'HostOnly']
})
export default class extends GodfatherCommand {

	public async run(msg: Message, args: Args) {
		const setup = await args.rest('string').catch(() => '');
		const { game } = msg.channel as TextChannel;

		if (game!.hasStarted) throw 'The game has already started!';
		if (game!.setup && game!.setup.totalPlayers !== game!.players.length) throw `The setup **${game!.setup.name}** requires ${game!.setup.totalPlayers} players.`;

		if (!game!.setup && setup === '') {
			// attempt to find a setup
			// TODO: prompt for multiple setups here
			const foundSetup = this.client.setups.find(setup => setup.totalPlayers === game?.players.length);
			if (!foundSetup) throw `No setups found for ${game!.players.length} players.`;
			game!.setup = foundSetup!;
		}
		const sent = await msg.channel.send(`Chose the setup **${game!.setup!.name}**. Randomizing roles...`);
		const generatedRoles = game!.setup!.generate();
		for (const player of game!.players) {
			player.role = new (generatedRoles.shift()!)(player);
			await player.sendPM();
		}
		await sent.edit('Sent all role PMs!');
		if (game!.setup!.nightStart) {
			return game!.startNight();
		}
		return game!.startDay();
	}

}
