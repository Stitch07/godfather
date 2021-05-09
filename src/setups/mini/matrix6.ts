import BasicSetup from '@mafia/structures/BasicSetup';
import type { SetupOptions } from '@mafia/structures/Setup';
import { ApplyOptions } from '@sapphire/decorators';
import type { Client } from 'discord.js';
import { randomArrayItem } from '@root/lib/util/utils';

@ApplyOptions<SetupOptions>({
	name: 'matrix6'
})
export default class extends BasicSetup {
	/* eslint-disable-next-line */
	public get totalPlayers() {
		return 9;
	}

	public generate(client: Client) {
		const options = [
			['Jailkeeper', 'Consort', 'Bulletproof'],
			['Vanilla', 'Cop', 'Mafia Vanilla'],
			['Goon', 'Doctor', 'Tracker'],
			['Jailkeeper', 'Vanilla', 'Mafia Vanilla'],
			['Consort', 'Cop', 'Doctor'],
			['Bulletproof', 'Mafia Vanilla', 'Tracker']
		];

		const base = ['Vanilla x5', 'Goon'];
		this.roles = base.concat(randomArrayItem(options)!);
		return super.generate(client);
	}

	public getRoleList() {
		/* TODO: i18n this */
		return [
			'One row or column is picked from the following table:',
			'',
			'           A                  B                    C',
			'1    Town Jailkeeper    Vanilla Townie       Mafia Vanilla',
			'2    Consort            Town Cop             Town Doctor',
			'3    Bulletproof    	 Mafia Vanilla        Town Tracker',
			'',
			'Five Vanilla Townies and one Goon is added to create the rolelist.'
		].join('\n');
	}
}
