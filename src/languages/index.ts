import type { Handler } from '@lib/i18n/structures/Handler';
import { EnUsHandler } from './en-US/constants';
import { NlNLHandler } from './nl-NL/constants';
import { PtPTHandler } from './pt-PT/constants';

export const handlers = new Map<string, Handler>([
	['en-US', new EnUsHandler()],
	['nl-NL', new NlNLHandler()],
	['pt-PT', new PtPTHandler()]
]);

export function getHandler(lang: string) {
	return handlers.get(lang) ?? new EnUsHandler();
}
