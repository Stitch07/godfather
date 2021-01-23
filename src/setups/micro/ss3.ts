import BasicSetup from '@mafia/structures/BasicSetup';
import type { SetupOptions } from '@mafia/structures/Setup';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SetupOptions>({
  name: 'ss3',
  roles: ['Super Saint', 'Vanilla', 'Goon']
})
export default class extends BasicSetup {
  public description = 'Super Saint 3 (https://wiki.mafiascum.net/index.php?title=SS3)';
}
