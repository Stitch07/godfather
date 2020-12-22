import { Store } from '@sapphire/framework';
import SlashCommand from './SlashCommand';

export default class SlashCommandStore extends Store<SlashCommand> {

	public constructor() {
		super(SlashCommand as any, { name: 'slashCommands' });
	}

}
