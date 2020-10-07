require('module-alias/register');

import Godfather from '@lib/Godfather';
import { TOKEN } from './config';
import { init } from '@mafia/roles/index';

init();

const client = new Godfather();

client.login(TOKEN);
