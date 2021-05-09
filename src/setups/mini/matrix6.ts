import BasicSetup from '@mafia/structures/BasicSetup';
import type { SetupOptions } from '@mafia/structures/Setup';
import { ApplyOptions } from '@sapphire/decorators';
import type { Client } from 'discord.js';
import { randomArrayItem } from '@root/lib/util/utils';

@ApplyOptions<SetupOptions>({
	name: 'matrix6'
})
export default class extends BasicSetup {
	public generate(client: Client) {
		const options = [
			['Jailkeeper', 'Consort', 'Bulletproof'],
			['Vanilla', 'Cop', 'Goon'],
			['Goon', 'Doctor', 'Tracker'],
			['Jailkeeper', 'Vanilla', 'Goon'],
			['Consort', 'Cop', 'Doctor'],
			['Bulletproof', 'Goon', 'Tracker']
		];

		const base = ['Vanilla x5', 'Goon'];
		this.roles = base.concat(randomArrayItem(options)!);
		return super.generate(client);
	}
}
