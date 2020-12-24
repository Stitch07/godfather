// #region bot token
export const TOKEN = process.env.TOKEN!;
// #endregion

export const CLIENT_ID = process.env.CLIENT_ID ?? '734726524288368680';

export const SUPPORT_SERVER = process.env.SUPPORT_SERVER ?? 'https://discord.gg/gFhvChy';

export const PRODUCTION = process.env.NODE_ENV === 'production';

export const PREFIX = PRODUCTION ? (process.env.PRODUCTION_PREFIX ?? '=') : (process.env.DEV_PREFIX ?? 'gd!');

export const PGSQL_ENABLED = process.env.PGSQL_ENABLED === 'true';
export const PGSQL_DATABASE_NAME = 'godfather';
export const PGSQL_DATABASE_PASSWORD = process.env.PGSQL_DATABASE_PASSWORD ?? '';
export const PGSQL_DATABASE_USER = process.env.PGSQL_DATABASE_USER ?? 'postgres';
export const PGSQL_DATABASE_PORT = Number(process.env.PGSQL_DATABASE_PORT) ?? 5432;
export const PGSQL_DATABASE_HOST = process.env.PGSQL_DATABASE_HOST ?? 'localhost';

export const PRIVATE_CHANNEL_SERVER = process.env.PRIVATE_CHANNEL_SERVER ?? '732226178085027900';
export const { PRIVATE_CHANNEL_CATEGORY } = process.env;

export const ENABLE_PRIVATE_CHANNELS = process.env.ENABLE_PRIVATE_CHANNELS ? Boolean(process.env.ENABLE_PRIVATE_CHANNELS) : false;
