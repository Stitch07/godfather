import { DEFAULT_GAME_SETTINGS } from '@root/lib/constants';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class GameSettings1605441341946 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn('guild_settings', new TableColumn({
			'name': 'dayDuration',
			'type': 'integer',
			'default': DEFAULT_GAME_SETTINGS.dayDuration,
			'isNullable': false
		}));

		await queryRunner.addColumn('guild_settings', new TableColumn({
			'name': 'nightDuration',
			'type': 'integer',
			'default': DEFAULT_GAME_SETTINGS.nightDuration,
			'isNullable': false
		}));

		await queryRunner.addColumn('guild_settings', new TableColumn({
			'name': 'overwritePermissions',
			'type': 'boolean',
			'default': DEFAULT_GAME_SETTINGS.overwritePermissions,
			'isNullable': false
		}));
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await Promise.all([
			'dayDuration',
			'nightDuration',
			'overwritePermissions'
		].map(colName => queryRunner.dropColumn('guild_settings', colName)));
	}

}
