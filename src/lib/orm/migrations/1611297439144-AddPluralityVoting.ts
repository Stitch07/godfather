import { DEFAULT_GAME_SETTINGS } from '@lib/constants';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPluralityVoting1611297439144 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn('guild_settings', new TableColumn({
			'name': 'enable_plurality',
			'type': 'boolean',
			'default': DEFAULT_GAME_SETTINGS.enablePlurality,
			'isNullable': false
		}));
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guild_settings', 'enable_plurality');
	}

}
