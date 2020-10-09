import { Client, Guild } from 'discord.js';
import { EntityRepository, Repository } from 'typeorm';
import GuildSettings from '../entities/GuildSettings';

@EntityRepository(GuildSettings)
export default class GuildSettingRepository extends Repository<GuildSettings> {

	public async ensure(client: Client, guild: Guild) {
		const cached = client.settingsCache.get(guild.id);
		if (cached) return cached;

		let settings = await this.findOne(guild.id);
		if (settings) {
			client.settingsCache.set(guild.id, settings);
			return settings;
		}

		settings = new GuildSettings();
		settings.id = guild.id;
		client.settingsCache.set(guild.id, settings);
		return settings;
	}

	public async updateSettings(client: Client, settings: GuildSettings) {
		if (client.settingsCache.has(settings.id)) client.settingsCache.delete(settings.id);
		await this.save(settings);
		client.settingsCache.set(settings.id, settings);
	}

}
