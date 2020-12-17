// #region bot token
export const TOKEN = 'YOUR_BOT_TOKEN_HERE';
// #endregion

export const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';

export const SUPPORT_SERVER = 'https://discord.gg/gFhvChy';

export const PRODUCTION = 'PRODUCTION' in process.env ? process.env.PRODUCTION === 'true' : ('PM2_HOME' in process.env);

export const PREFIX = PRODUCTION ? '=' : 'g!';

export const PGSQL_ENABLED = false;
export const PGSQL_DATABASE_NAME = 'godfather';
export const PGSQL_DATABASE_PASSWORD = '';
export const PGSQL_DATABASE_USER = '';
export const PGSQL_DATABASE_PORT = 5432;
export const PGSQL_DATABASE_HOST = 'localhost';

export const PRIVATE_CHANNEL_SERVER = '';
export const PRIVATE_CHANNEL_CATEGORY: string | null = null;
export const ENABLE_PRIVATE_CHANNELS = false;
