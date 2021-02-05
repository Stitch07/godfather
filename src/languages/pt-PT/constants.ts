import { Handler } from '@lib/i18n/structures/Handler';
import { TimeTypes } from '@sapphire/time-utilities';

export class PtPTHandler extends Handler {
	public constructor() {
		super({
			name: 'pt-PT',
			duration: {
				[TimeTypes.Year]: {
					1: 'ano',
					DEFAULT: 'anos'
				},
				[TimeTypes.Month]: {
					1: 'mês',
					DEFAULT: 'meses'
				},
				[TimeTypes.Week]: {
					1: 'semana',
					DEFAULT: 'semanas'
				},
				[TimeTypes.Day]: {
					1: 'dia',
					DEFAULT: 'dias'
				},
				[TimeTypes.Hour]: {
					1: 'hora',
					DEFAULT: 'horas'
				},
				[TimeTypes.Minute]: {
					1: 'minuto',
					DEFAULT: 'minutos'
				},
				[TimeTypes.Second]: {
					1: 'segundo',
					DEFAULT: 'segundos'
				}
			}
		});
	}

	public ordinal(cardinal: number): string {
		return `${cardinal}e`;
	}
}
