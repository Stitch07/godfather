import BasicSetup from '@mafia/structures/BasicSetup';
import type { SetupOptions } from '@mafia/structures/Setup';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SetupOptions>({
  name: 'cultseven',
  roles: ['Cult Leader', 'Godfather', 'Random Town - {Ret;Reanimator} x5']
})
export default class extends BasicSetup {}
