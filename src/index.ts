import 'module-alias/register';

import Godfather from '@lib/Godfather';
import { init as roleInit } from '@mafia/roles/index';
import { PRODUCTION, SENTRY_DSN, TOKEN } from '@root/config';
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import { join } from 'path';
import { floatPromise, initClean } from './lib/util/utils';

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
      ],
      release: `godfather@${client.version}`
    });
  }

  void roleInit();
  initClean();

  await client.login(TOKEN);
}

floatPromise(client, init());
