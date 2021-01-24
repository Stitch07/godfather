import { PREFIX } from '@root/config';
import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class InitialMigration1602143891029 implements MigrationInterface {
	public name = 'InitialMigration1602143891029';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'guild_settings',
				columns: [
					new TableColumn({ name: 'id', type: 'varchar', length: '19', isNullable: false, isPrimary: true }),
					new TableColumn({ name: 'prefix', type: 'varchar', length: '10', isNullable: false, default: `'${PREFIX}'` })
				]
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('guild_settings');
	}
}
