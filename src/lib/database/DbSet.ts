/**
 * Heavily adapted from https://github.com/skyra-project/skyra
 * Copyright 2019-2020 Antonio Román
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import GameEntity from '@lib/orm/entities/Game';
import GuildSettingsEntity from '@lib/orm/entities/GuildSettings';
import PlayerEntity from '@lib/orm/entities/Player';
import { connect } from '@lib/orm/ormConfig';
import GuildSettingRepository from '@lib/orm/repositories/GuildSettingRepository';
import type { Guild } from 'discord.js';
import type { Connection, Repository } from 'typeorm';

export class DbSet {
	public readonly connection: Connection;
	public readonly guilds: GuildSettingRepository;
	public readonly games: Repository<GameEntity>;
	public readonly players: Repository<PlayerEntity>;

	private constructor(connection: Connection) {
		this.connection = connection;
		this.guilds = this.connection.getCustomRepository(GuildSettingRepository);
		this.games = this.connection.getRepository(GameEntity);
		this.players = this.connection.getRepository(PlayerEntity);
	}

	private static instance: DbSet | null = null;
	private static connectPromise: Promise<DbSet> | null;

	public static async connect() {
		return (DbSet.instance ??= await (DbSet.connectPromise ??= connect().then((connection) => {
			DbSet.connectPromise = null;
			return new DbSet(connection);
		})));
	}

	public static async getSettings(guild: Guild) {
		const { guilds } = await DbSet.connect();
		const guildSettings = await guilds.findOne({ id: guild.id });
		if (guildSettings) return guildSettings;
		const newSettings = new GuildSettingsEntity();
		newSettings.id = guild.id;
		return newSettings;
	}
}
