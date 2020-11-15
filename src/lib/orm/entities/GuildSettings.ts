import { PREFIX } from '@root/config';
import { DEFAULT_GAME_SETTINGS } from '@lib/constants';
import { GameSettings } from 'lib/mafia/Game';
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

	@Column('boolean', { 'default': true })
	public overwritePermissions = true;

}
