require('module-alias/register');

import Godfather from '@lib/Godfather';
import { token } from './config';

const client = new Godfather();
client.token = token;

client.connect();
