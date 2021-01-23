import { Store } from '@sapphire/framework';
import Setup from './Setup';

export default class SetupStore extends Store<Setup> {
  public constructor() {
    super(Setup as any, { name: 'setups' });
  }
}
