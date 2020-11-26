import { Args, CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Message } from 'discord.js';
import GodfatherCommand from '@lib/GodfatherCommand';
import BasicSetup from '@lib/mafia/BasicSetup';

@ApplyOptions<CommandOptions>({
	preconditions: ['GuildOnly', 'GameOnly', 'HostOnly']
})
export default class extends GodfatherCommand {

	public async run(message: Message, args: Args) {
		const game = message.channel.game!;
		if (game.hasStarted) throw "You can't change the setup after the game has started.";
		let setupData = await args.rest('string')
			.catch(() => { throw 'Missing required argument: setup data/name'; });

		if (this.client.setups.has(setupData)) {
			game.setup = this.client.setups.get(setupData);
		} else {
			const setup = BasicSetup.create(setupData);
			const check = setup.ok(setup.generate());
			if (!check.success) throw `Invalid setup: ${check.error}`;
			game.setup = setup;
		}

		return message.channel.send(`Using the setup: \`${game.setup!.name}\``);
	}

}
