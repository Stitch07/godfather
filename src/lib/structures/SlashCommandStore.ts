import { BaseStore, SapphireClient } from '@sapphire/framework';
import { LoadMultiple } from '@sapphire/pieces';
import SlashCommand from './SlashCommand';

export default class SlashCommandStore extends BaseStore<SlashCommand> {

	public constructor(client: SapphireClient) {
		super(client, SlashCommand as any, { name: 'slashCommands', loadHook: LoadMultiple.load.bind(LoadMultiple) });
	}

}
