import { PREFIX } from '@root/config';
import { DEFAULT_GAME_SETTINGS } from '@lib/constants';
import { GameSettings } from '@mafia/structures/Game';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'guild_settings' })
export default class GuildSettingsEntity implements GameSettings {

	@PrimaryColumn('varchar', { length: 19 })
	public id!: string;

	@Column('varchar', { 'length': 10, 'default': PREFIX })
	public prefix = PREFIX;

	@Column('integer', { 'default': DEFAULT_GAME_SETTINGS.dayDuration })
	public dayDuration = DEFAULT_GAME_SETTINGS.dayDuration;

	@Column('integer', { 'default': DEFAULT_GAME_SETTINGS.nightDuration })
	public nightDuration = DEFAULT_GAME_SETTINGS.nightDuration;

	@Column('integer', { 'default': DEFAULT_GAME_SETTINGS.maxPlayers })
	public maxPlayers = DEFAULT_GAME_SETTINGS.maxPlayers;

	@Column('boolean', { 'default': true })
	public overwritePermissions = true;

	@Column('boolean', { 'default': false })
	public disableWhispers = false;

	@Column('varchar', { 'length': 19, 'array': true, 'default': () => 'ARRAY[]::VARCHAR[]' })
	public disabledChannels: string[] = [];

	@Column('boolean', { 'default': false })
	public numberedNicknames = false;

	@Column('boolean', { 'default': false })
	public muteAtNight = false;

	@Column('boolean', { 'default': false })
	public adaptiveSlowmode = false;

	@Column('boolean', { 'default': false })
	public disableWills = false;

	@Column('boolean', { 'default': false })
	public enableTrials = false;

	@Column('boolean', { 'default': false })
	public enablePlurality = true;

	@Column('integer', { 'default': DEFAULT_GAME_SETTINGS.maxTrials })
	public maxTrials = DEFAULT_GAME_SETTINGS.maxTrials;

}
