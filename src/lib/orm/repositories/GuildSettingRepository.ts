import type { Guild } from 'discord.js';
import { EntityRepository, Repository } from 'typeorm';
import GuildSettingsEntity from '@lib/orm/entities/GuildSettings';

@EntityRepository(GuildSettingsEntity)
export default class GuildSettingRepository extends Repository<GuildSettingsEntity> {
	public async ensure(guild: Guild) {
		const guildSettings = await this.findOne({ id: guild.id });
		if (guildSettings) return guildSettings;
		const newSettings = new GuildSettingsEntity();
		newSettings.id = guild.id;
		return newSettings;
	}
}
