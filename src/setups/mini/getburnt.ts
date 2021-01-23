import BasicSetup from '@mafia/structures/BasicSetup';
import type { SetupOptions } from '@mafia/structures/Setup';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SetupOptions>({
  name: 'getburnt',
  roles: ['Vanilla x6', 'Arsonist', 'Jester']
})
export default class extends BasicSetup {}
