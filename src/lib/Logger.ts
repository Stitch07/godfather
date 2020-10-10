import { PRODUCTION } from '@root/config';
import { Logger, LogLevel } from '@sapphire/framework';
import { createLogger, Logger as WinstonLogger, format, transports } from 'winston';

const colorizer = format.colorize();

export default class implements Logger {

	public level = PRODUCTION ? LogLevel.Info : LogLevel.Debug;

	private inner: WinstonLogger;

	public constructor() {
		this.inner = createLogger({
			level: PRODUCTION ? 'info' : 'debug',
			format: format.json()
		});

		if (PRODUCTION) {
			this.inner
				.add(new transports.File({ filename: 'error.log', level: 'error' }))
				.add(new transports.File({ filename: 'combined.log' }));
		} else {
			this.inner
				.add(new transports.Console({
					format: format.combine(
						format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss A' }),
						format.simple(),
						format.printf(msg =>
						  colorizer.colorize(msg.level, `${msg.timestamp} - ${msg.level}: ${msg.message}`))
					)
				}));
		}
	}

	public trace(...values: readonly unknown[]) {
		// @ts-ignore idk ill figure this later
		this.inner.silly(this._transform(values));
	}

	public debug(...values: readonly unknown[]) {
		// @ts-ignore idk ill figure this later
		this.inner.debug(this._transform(values));
	}

	public info(...values: readonly unknown[]) {
		// @ts-ignore idk ill figure this later
		this.inner.info(this._transform(values));
	}

	public warn(...values: readonly unknown[]) {
		// @ts-ignore idk ill figure this later
		this.inner.warn(this._transform(values));
	}

	public error(...values: readonly unknown[]) {
		for (const value of values) {
			if (value instanceof Error) this.inner.error(value.stack || value);
			else this.inner.error(value);
		}
	}

	public fatal(...values: readonly unknown[]) {
		this.error(...values);
	}

	public write(level: LogLevel, ...values: readonly unknown[]) {
		// @ts-ignore idk ill figure this later
		this.inner.log(WINSTON_LEVELS[level], ...values);
	}

	private _transform(value: unknown): unknown {
		if (Array.isArray(value)) {
			if (value.length === 1) return value[0];
			return `[${value.map(ele => this._transform(ele)).join('\n')}]`;
		}
		return value;
	}

}

export const WINSTON_LEVELS = {
	10: 'silly',
	20: 'debug',
	30: 'info',
	40: 'warn',
	50: 'error',
	60: 'error',
	100: 'silly'
};
