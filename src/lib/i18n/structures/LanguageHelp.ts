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
export class LanguageHelp {
	private aliases: string = null!;
	private usages: string = null!;
	private extendedHelp: string = null!;
	private possibleFormats: string = null!;
	private examples: string = null!;
	private reminder: string = null!;

	public setAliases(text: string) {
		this.aliases = text;
		return this;
	}

	public setUsages(text: string) {
		this.usages = text;
		return this;
	}

	public setExtendedHelp(text: string) {
		this.extendedHelp = text;
		return this;
	}

	public setPossibleFormats(text: string) {
		this.possibleFormats = text;
		return this;
	}

	public setExamples(text: string) {
		this.examples = text;
		return this;
	}

	public setReminder(text: string) {
		this.reminder = text;
		return this;
	}

	public display(name: string, aliases: string | null, options: LanguageHelpDisplayOptions, prefixUsed: string) {
		const { usages = [], extendedHelp, possibleFormats = [], examples = [], reminder } = options;
		const output: string[] = [];

		// Usages
		if (usages.length) {
			output.push(this.usages, ...usages.map((usage) => `→ ${prefixUsed}${name}${usage.length === 0 ? '' : ` *${usage}*`}`), '');
		}

		if (aliases !== null) {
			output.push(`${this.aliases}: ${aliases}`, '');
		}

		// Extended help
		if (extendedHelp) {
			output.push(this.extendedHelp, Array.isArray(extendedHelp) ? extendedHelp.join('\n') : extendedHelp, '');
		}

		// Possible formats
		if (possibleFormats.length) {
			output.push(this.possibleFormats, ...possibleFormats.map(([type, example]) => `→ **${type}**: ${example}`), '');
		}

		// Examples
		if (examples.length) {
			output.push(this.examples, ...examples.map((example) => `→ ${prefixUsed}${name}${example ? ` *${example}*` : ''}`), '');
		} else {
			output.push(this.examples, `→ ${prefixUsed}${name}`, '');
		}

		// Reminder
		if (reminder) {
			output.push(this.reminder, reminder);
		}

		return output.join('\n');
	}
}

export interface LanguageHelpDisplayOptions {
	usages?: string[];
	extendedHelp?: string;
	possibleFormats?: [string, string][];
	examples?: (null | string)[];
	reminder?: string;
}
