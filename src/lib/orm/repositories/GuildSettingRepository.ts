import type { Guild } from 'discord.js';
import { EntityRepository, Repository } from 'typeorm';
import GuildSettingsEntity from '@lib/orm/entities/GuildSettings';

@EntityRepository(GuildSettingsEntity)
export default class GuildSettingRepository extends Repository<GuildSettingsEntity> {
	public async ensure(guild: Guild) {
		const guildSettings = await this.findOne({ id: guild.id });
		return guildSettings ?? new GuildSettingsEntity();
	}
}
