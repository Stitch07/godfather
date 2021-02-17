/**
 * Heavily adapted from https://github.com/skyra-project/skyra
 * Copyright 2019-2020 Antonio Román
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { DurationFormatAssetsTime, DurationFormatter } from '@sapphire/time-utilities';

export abstract class Handler {
	public readonly name: string;
	public readonly number: Intl.NumberFormat;
	public readonly numberCompact: Intl.NumberFormat;
	public readonly listAnd: Intl.ListFormat;
	public readonly listOr: Intl.ListFormat;
	public readonly date: Intl.DateTimeFormat;
	public readonly dateTime: Intl.DateTimeFormat;
	public readonly duration: DurationFormatter;

	public constructor(options: Handler.Options) {
		this.name = options.name;
		this.number = new Intl.NumberFormat(this.name, { maximumFractionDigits: 2 });
		this.numberCompact = new Intl.NumberFormat(this.name, { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 2 });
		this.listAnd = new Intl.ListFormat(this.name, { type: 'conjunction' });
		this.listOr = new Intl.ListFormat(this.name, { type: 'disjunction' });
		this.date = new Intl.DateTimeFormat(this.name, { timeZone: 'Etc/UTC', dateStyle: 'short' });
		this.dateTime = new Intl.DateTimeFormat(this.name, { timeZone: 'Etc/UTC', dateStyle: 'short', timeStyle: 'medium' });
		this.duration = new DurationFormatter(options.duration);
	}
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Handler {
	export interface Options {
		name: string;
		duration: DurationFormatAssetsTime;
	}
}
