import { DurationFormatter } from '@sapphire/time-utilities';

const formatter = new DurationFormatter();

export const format = (duration: number) => formatter.format(duration);
