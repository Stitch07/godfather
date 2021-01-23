import { DEFAULT_GAME_SETTINGS } from '@root/lib/constants';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTrials1610459959481 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn(
			'guild_settings',
			new TableColumn({
				name: 'enable_trials',
				type: 'boolean',
				default: DEFAULT_GAME_SETTINGS.enableTrials,
				isNullable: false
			})
		);

		await queryRunner.addColumn(
			'guild_settings',
			new TableColumn({
				name: 'max_trials',
				type: 'integer',
				default: DEFAULT_GAME_SETTINGS.maxTrials,
				isNullable: false
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guild_settings', 'enable_trials');
		await queryRunner.dropColumn('guild_settings', 'max_trials');
	}
}
