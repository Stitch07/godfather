import type GuildSettingsEntity from '@lib/orm/entities/GuildSettings';
import GuildSettingRepository from '@lib/orm/repositories/GuildSettingRepository';
import { Guild } from 'discord.js';
import { getCustomRepository } from 'typeorm';

export default class GodfatherGuild extends Guild {
  public async readSettings(): Promise<GuildSettingsEntity> {
    const guildSettings = await getCustomRepository(GuildSettingRepository).ensure(this.client, this);
    return guildSettings;
  }

  public async updateSettings(newSettings: GuildSettingsEntity) {
    await getCustomRepository(GuildSettingRepository).updateSettings(this.client, newSettings);
  }
}
