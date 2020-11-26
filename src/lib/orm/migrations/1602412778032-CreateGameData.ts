import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class CreateGameData1602412778032 implements MigrationInterface {

	public name = 'CreateGameData1602412778032';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(new Table({
			name: 'games',
			columns: [
				new TableColumn({ name: 'id', type: 'integer', isPrimary: true, isNullable: false, isGenerated: true, generationStrategy: 'increment' }),
				new TableColumn({ name: 'setup_name', type: 'varchar', length: '50', isNullable: false }),
				new TableColumn({ name: 'winning_faction', type: 'varchar', length: '30', isNullable: true }),
				new TableColumn({ name: 'guild_id', type: 'varchar', length: '19', isNullable: false }),
				new TableColumn({ 'name': 'independent_wins', 'type': 'varchar', 'isArray': true, 'default': 'ARRAY[]::VARCHAR[]' })
			]
		}));

		await queryRunner.createTable(new Table({
			name: 'players',
			columns: [
				new TableColumn({ name: 'id', type: 'integer', isPrimary: true, isNullable: false, isGenerated: true, generationStrategy: 'increment' }),
				new TableColumn({ name: 'user_id', type: 'varchar', length: '19', isNullable: false }),
				new TableColumn({ name: 'faction', type: 'varchar', length: '30' }),
				new TableColumn({ name: 'role_name', type: 'varchar', length: '30' }),
				new TableColumn({ name: 'result', type: 'boolean' })
			]
		}));
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('games');
		await queryRunner.dropTable('players');
	}

}
