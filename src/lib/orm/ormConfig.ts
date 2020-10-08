import { PGSQL_DATABASE_HOST, PGSQL_DATABASE_NAME, PGSQL_DATABASE_PASSWORD, PGSQL_DATABASE_PORT, PGSQL_DATABASE_USER, PRODUCTION } from '@root/config';
import { join } from 'path';
import { Connection, ConnectionOptions, createConnection, getConnection } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const config: ConnectionOptions = {
	type: 'postgres',
	host: PGSQL_DATABASE_HOST,
	port: PGSQL_DATABASE_PORT,
	username: PGSQL_DATABASE_USER,
	password: PGSQL_DATABASE_PASSWORD,
	database: PGSQL_DATABASE_NAME,
	entities: [join(__dirname, 'entities/*.js')],
	migrations: [join(__dirname, 'migrations/*.ts')],
	cli: {
		entitiesDir: 'src/lib/orm/entities',
		migrationsDir: 'dist/lib/orm/migrations',
		subscribersDir: 'src/lib/orm/subscribers'
	},
	namingStrategy: new SnakeNamingStrategy(),
	logging: !PRODUCTION
};

export const connect = (): Promise<Connection> => {
	try {
		return Promise.resolve(getConnection());
	} catch {
		return createConnection(config);
	}
};
