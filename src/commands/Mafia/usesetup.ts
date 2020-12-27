import GodfatherCommand from '#lib/GodfatherCommand';
import BasicSetup from '#lib/mafia/BasicSetup';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'Uses a custom setup.',
	detailedDescription: [
		'The simplest form is a list of roles separated by commas, for example usesetup Vigilante, Goon, Vanilla x5',
		'',
		'To add your own name and start games at night, you may need to use [YAML](https://yaml.org/). The format for that is:',
		'```yaml',
		'roles: [Vigilante, Goon, Vanilla x5]',
		'nightStart: true',
		'name: your_setup_name',
		'```'
	].join('\n'),
	preconditions: ['GuildOnly', 'GameOnly', 'HostOnly']
})
export default class extends GodfatherCommand {

	public async run(message: Message, args: Args) {
		const game = message.channel.game!;
		if (game.hasStarted) throw "You can't change the setup after the game has started.";
		let setupData = await args.rest('string')
			.catch(() => { throw 'Missing required argument: setup data/name'; });

		if (this.context.client.setups.has(setupData)) {
			game.setup = this.context.client.setups.get(setupData);
		} else {
			const setup = BasicSetup.create(this.clean(setupData));
			const check = setup.ok(setup.generate());
			if (!check.success) throw `Invalid setup: ${check.error}`;
			game.setup = setup;
		}

		return message.channel.send(`Using the setup: \`${game.setup!.name}\``);
	}

	private clean(data: string) {
		return data.replace(/(```yaml)|(```)/g, '');
	}

}
