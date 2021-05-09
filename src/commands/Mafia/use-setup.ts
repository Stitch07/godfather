import GodfatherCommand from '@lib/GodfatherCommand';
import BasicSetup from '@mafia/structures/BasicSetup';
import { handleRequiredArg } from '@root/lib/util/utils';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	aliases: ['usesetup'],
	description: 'commands/help:usesetupDescription',
	detailedDescription: 'commands/help:usesetupDetailed',
	preconditions: ['GuildOnly', 'GameOnly', 'HostOnly'],
	strategyOptions: {
		flags: ['nightStart', 'n']
	}
})
export default class extends GodfatherCommand {
	public async run(message: Message, args: Args) {
		const game = message.channel.game!;
		if (game.hasStarted) throw await message.resolveKey('commands/mafia:usesetupNoChange');
		const setupData = await args.rest('string').catch(handleRequiredArg('setupData'));

		if (this.context.client.stores.get('setups').has(setupData)) {
			game.setup = this.context.client.stores.get('setups').get(setupData);
		} else {
			const setup = BasicSetup.create(this.context.client, this.clean(setupData));
			const check = setup.ok(setup.generate(this.context.client));
			if (!check.success) throw await message.resolveKey('commands/mafia:usesetupError', { error: check.error });
			game.setup = setup;
		}

		if (args.getFlags('nightStart', 'n')) game.setup!.nightStart = true;
		return message.channel.sendTranslated('commands/mafia:usesetupSuccess', [{ setup: game.setup!.name }]);
	}

	private clean(data: string) {
		return data.replace(/(```yaml)|(```)/g, '');
	}
}
