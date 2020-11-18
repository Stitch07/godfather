import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class CreateGameData1602412778032 implements MigrationInterface {

	public name = 'CreateGameData1602412778032';

	public async up(queryRunner: QueryRunner): Promise<void> {
		// await queryRunner.query(`CREATE TABLE "games" ("id" SERIAL NOT NULL, "setup_name" character varying(50) NOT NULL, "winning_faction" character varying(30), "independent_wins" character varying(30) array NOT NULL DEFAULT ARRAY[]::VARCHAR[], "guild_id" character varying(19) NOT NULL, CONSTRAINT "PK_c9b16b62917b5595af982d66337" PRIMARY KEY ("id"))`);
		// await queryRunner.query(`CREATE TABLE "players" ("id" SERIAL NOT NULL, "faction" character varying(30) NOT NULL, "role_name" character varying(30) NOT NULL, "result" boolean NOT NULL, CONSTRAINT "PK_de22b8fdeee0c33ab55ae71da3b" PRIMARY KEY ("id"))`);
		// await queryRunner.query(`ALTER TABLE "players" DROP CONSTRAINT "PK_de22b8fdeee0c33ab55ae71da3b"`);
		// await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "id"`);
		// await queryRunner.query(`ALTER TABLE "players" ADD "id" character varying(19) NOT NULL`);
		await queryRunner.createTable(new Table({
			name: 'games',
			columns: [
				new TableColumn({ name: 'id', type: 'integer', isPrimary: true, isNullable: false, isGenerated: true, generationStrategy: 'increment' }),
				new TableColumn({ name: 'setup_name', type: 'varchar', length: '50', isNullable: false }),
				new TableColumn({ name: 'winning_faction', type: 'varchar', length: '30' }),
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
