require('module-alias/register');

import Godfather from '@lib/Godfather';
import { init as roleInit } from '@mafia/roles/index';
import { PRODUCTION, TOKEN, SENTRY_DSN } from '@root/config';
import { floatPromise, initClean } from './lib/util/utils';

import * as Sentry from '@sentry/node';
import { RewriteFrames } from '@sentry/integrations';
import { join } from 'path';

const client = new Godfather();

async function init() {
	if (SENTRY_DSN !== '') {
		Sentry.init({
			dsn: SENTRY_DSN,
			environment: PRODUCTION ? 'production' : 'development',
			integrations: [
				new Sentry.Integrations.OnUnhandledRejection(),
				new Sentry.Integrations.Modules(),
				new Sentry.Integrations.FunctionToString(),
				new Sentry.Integrations.LinkedErrors(),
				new Sentry.Integrations.Console(),
				new Sentry.Integrations.Http({ breadcrumbs: true, tracing: true }),
				new RewriteFrames({ root: join(__dirname, '..') })
			]
		});
	}

	roleInit();
	initClean();

	await client.login(TOKEN);
}

floatPromise(client, init());
