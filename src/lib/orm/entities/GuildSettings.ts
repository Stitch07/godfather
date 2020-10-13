import { PREFIX } from '@root/config';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'guild_settings' })
export default class GuildSettingsEntity {

	@PrimaryColumn('varchar', { name: 'id', length: 19 })
	public id!: string;

	@Column('varchar', { 'length': 10, 'default': PREFIX })
	public prefix = PREFIX;

}
