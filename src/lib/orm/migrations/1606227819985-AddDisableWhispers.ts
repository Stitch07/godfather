import { DEFAULT_GAME_SETTINGS } from '#lib/constants';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDisableWhispers1606227819985 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn('guild_settings', new TableColumn({
			'name': 'disable_whispers',
			'type': 'boolean',
			'default': DEFAULT_GAME_SETTINGS.disableWhispers,
			'isNullable': false
		}));
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guild_settings', 'disable_whispers');
	}

}
