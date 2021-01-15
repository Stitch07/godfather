require('module-alias/register');

import Godfather from '@lib/Godfather';
import { init } from '@mafia/roles/index';
import { TOKEN } from '@root/config';
import { initUtils } from './lib/util/utils';

init();
initUtils();

const client = new Godfather();

client.login(TOKEN);
