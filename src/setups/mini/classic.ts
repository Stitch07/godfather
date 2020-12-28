import { SetupOptions } from '#mafia/structures/Setup';
import BasicSetup from '#mafia/structures/BasicSetup';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SetupOptions>({
	name: 'classic',
	roles: ['Cop', 'Doctor', 'Vanilla x3', 'Goon', 'Vanilla Mafia']
})
export default class extends BasicSetup {

}
