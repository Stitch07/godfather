require('module-alias/register');

import Godfather from '@lib/Godfather';
import { init } from '@mafia/roles/index';
import { TOKEN } from '@root/config';
import { initClean } from './lib/util/utils';

init();
initClean();

const client = new Godfather();

client.login(TOKEN);
