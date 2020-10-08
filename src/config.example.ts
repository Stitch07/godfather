// #region bot token
export const TOKEN = 'YOUR_BOT_TOKEN_HERE';
// #endregion

export const SUPPORT_SERVER = 'https://discord.gg/gFhvChy';

export const PRODUCTION = 'PRODUCTION' in process.env ? process.env.PRODUCTION === 'true' : ('PM2_HOME' in process.env);

export const PREFIX = PRODUCTION ? '=' : 'g!';

export const PGSQL_DATABASE_NAME = 'godfather';
export const PGSQL_DATABASE_PASSWORD = '';
export const PGSQL_DATABASE_USER = '';
export const PGSQL_DATABASE_PORT = 5432;
export const PGSQL_DATABASE_HOST = 'localhost';
