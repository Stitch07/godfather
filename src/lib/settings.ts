import { KlasaClient } from 'klasa';

KlasaClient.defaultGuildSchema
	// Game#config#day/nightDuration defaults to these
	.add('defaultDayDuration', 'integer', { 'default': 5 * 60 })
	.add('defaultNightDuration', 'integer', { 'default': 2 * 60 });

