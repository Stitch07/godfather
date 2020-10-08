import { Guild } from 'discord.js';
import { EntityRepository, Repository } from 'typeorm';
import GuildSettings from '../entities/GuildSettings';

@EntityRepository(GuildSettings)
export default class GuildSettingRepository extends Repository<GuildSettings> {

	public async get(guild: Guild) {
		let settings = await this.findOne(guild.id);
		if (settings) return settings;

		settings = new GuildSettings();
		settings.id = guild.id;
		return settings;
	}

}
