import { DEFAULT_GAME_SETTINGS } from '@lib/constants';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDisableWills1609419356972 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn('guild_settings', new TableColumn({
			'name': 'disable_wills',
			'type': 'boolean',
			'default': DEFAULT_GAME_SETTINGS.disableWhispers,
			'isNullable': false
		}));
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guild_settings', 'disable_wills');
	}

}
