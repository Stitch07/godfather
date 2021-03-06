import { DEFAULT_GAME_SETTINGS } from '@lib/constants';
import type { GameSettings } from '@mafia/structures/Game';
import { PREFIX } from '@root/config';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'guild_settings' })
export default class GuildSettingsEntity implements GameSettings {
	@PrimaryColumn('varchar', { length: 19 })
	public id!: string;

	@Column('varchar', { length: 10, default: PREFIX })
	public prefix = PREFIX;

	@Column('varchar', { default: 'en-US' })
	public language = 'en-US';

	@Column('integer', { default: DEFAULT_GAME_SETTINGS.dayDuration })
	public dayDuration = DEFAULT_GAME_SETTINGS.dayDuration;

	@Column('integer', { default: DEFAULT_GAME_SETTINGS.nightDuration })
	public nightDuration = DEFAULT_GAME_SETTINGS.nightDuration;

	@Column('integer', { default: DEFAULT_GAME_SETTINGS.maxPlayers })
	public maxPlayers = DEFAULT_GAME_SETTINGS.maxPlayers;

	@Column('boolean', { default: true })
	public overwritePermissions = true;

	@Column('boolean', { default: false })
	public whispers = false;

	@Column('varchar', { length: 19, array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public disabledChannels: string[] = [];

	@Column('boolean', { default: false })
	public numberedNicknames = false;

	@Column('boolean', { default: false })
	public muteAtNight = false;

	@Column('boolean', { default: false })
	public adaptiveSlowmode = false;

	@Column('boolean', { default: false })
	public wills = false;

	@Column('boolean', { default: false })
	public trials = false;

	@Column('boolean', { default: false })
	public pluralityVotes = false;

	@Column('integer', { default: DEFAULT_GAME_SETTINGS.maxTrials })
	public maxTrials = DEFAULT_GAME_SETTINGS.maxTrials;
}
