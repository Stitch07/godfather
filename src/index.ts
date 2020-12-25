require('module-alias/register');

import Godfather from '@lib/Godfather';
import { TOKEN } from './config';
import { init } from '@mafia/roles/index';
import { Store } from '@sapphire/framework';

Store.defaultStrategy.onLoadAll = (store: Store<any>) => store.context.client.logger.debug(`Loaded ${store.size} ${store.name}`);

init();

const client = new Godfather();

client.login(TOKEN);
